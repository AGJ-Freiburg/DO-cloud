<template>
  <div data-app>
    <div :class="this.status.logged_in ? 'bg-blur' : 'bg'">
      <!-- LOGIN COMPONENT -->
      <Login
        v-if="!this.status.logged_in && !this.status.files_loaded"
        :status="status"
        :restoreusername="restoreusername"
        @login="login"
        @update_username="username => (basicAuthentication.username = username)"
        @update_password="password => (basicAuthentication.password = password)"
        @update_restore_username="username => (basicAuthentication.username = username)"
      >
      </Login>
      <!-- FILEVIEWER COMPONENT -->
      <file-viewer
        v-if="this.status.logged_in"
        :mobile="mobile"
        :authString="basicAuthenticationstring"
        :status="status"
        :currentPath="currentPath"
        :currentSharedFolderIsUploadAble="currentSharedFolderIsUploadAble"
        :pathStack="pathStack"
        :shares="shares"
        :shareSearchResults="shareSearchResults"
        :rows="rows"
        :componentKey="componentKey"
        :institution="institution"
        :woloGroup="woloGroup"
        :woloGroups="woloGroups"
        :selectedWolo="selectedWolo"
        :group="group"
        :dragged="dragged"
        :dragged_items="dragged_items"
        :countDownCounter="countDownCounter"
        @dragover.prevent="onDragOperationStarted"
        @drop.prevent="onDrop"
        @select_admin="select_admin"
        @admin_delete="admin_delete"
        @admin_create_new_user_in_group="admin_create_new_user_in_group"
        @admin_update_member="admin_update_member"
        @remove="remove"
        @select="select"
        @parent="parent"
        @share="share"
        @sharesearch="sharesearch"
        @update_share="update_share"
        @delete_share="delete_share"
        @logout="logout"
        @error="error"
        @success="success"
        @download="download"
        @upload="upload"
        @move="move"
        @mkdir="mkdir"
        @rename="rename"
        @change_pw="update_password"
        @get_dir_content="get_dir_content"
        @refresh="refresh"
        @refresh_at_folder="refresh_at_folder"
        @resend_welcome="resend_welcome"
        @checkLanguageSettings="checkLanguageSettings"
      >
      </file-viewer>
      <auto-logout
        v-if="warning_autologout"
        :countDownCounter="countDownCounter"
        @resetCountDown="resetCountDown"
        @logout="logout"
      ></auto-logout>

      <!-- feedback mechanism -->
      <toast
        :dialog="show_sux_feedback"
        :message="feedback_message"
        :color="'#99b533'"
        :timeout="2000"
      >
      </toast>
      <toast
        :dialog="show_err_feedback"
        :message="feedback_message"
        :color="'#c72222'"
        :timeout="4000"
      >
      </toast>
      <!-- lanuge picker  -->
      <language-picker v-if="!status.logged_in"></language-picker>
      <!-- help button -->
      <help-button :mobile="mobile"></help-button>
      <!-- footer -->
      <do-footer :quota="quota" :status="status"></do-footer>
    </div>
  </div>
</template>

<script>
import AutoLogout from './AutoLogout.vue';
import FileViewer from './FileViewer.vue';
import LanguagePicker from './LanguagePicker.vue';
import Toast from './feedback/Toast.vue';
import DoFooter from './Footer.vue';
import Login from './Login.vue';
import HelpButton from './HelpButton.vue';
import { createClient } from 'webdav';
import base64 from 'base-64';
import { utils } from './../utils.js';

export default {
  name: 'Interface',

  mixins: [utils],

  components: {
    AutoLogout,
    FileViewer,
    Login,
    LanguagePicker,
    Toast,
    DoFooter,
    HelpButton
  },

  props: {
    dragged: Boolean,
    dragged_items: Array
  },

  computed: {
    mobile() {
      return this.$vuetify.breakpoint.xs;
    }
  },

  data() {
    return {
      webdavInstance: [],
      basicAuthentication: {
        username: '',
        password: ''
      },
      basicAuthenticationstring: '',
      institution: '',
      woloGroup: '',
      woloGroups: [],
      lang: '',
      componentKey: 0,
      // important informations of the user logged in
      status: {
        email: '',
        iswoloadmin: false,
        loading: false,
        files_loaded: false,
        logged_in: false,
        wolo_member_loaded: false,
        membercontrol_loading: false,
        wolo_folders: false,
        uploading: false,
        username: '',
        language: ''
      },
      selectedWolo: '',
      restoreusername: '',
      currentPath: '/',
      currentSharedFolderIsUploadAble: false,
      pathStack: [],
      group: undefined,
      show_sux_feedback: false,
      show_err_feedback: false,
      feedback_message: '',
      timeout: 3000,
      urlprefix: 'nextcloud/',
      shareSearchResults: undefined,
      quota: { used: '', total: '', free: '', used_percent: '' },
      shares: undefined,
      rows: [],
      countDownID: undefined,
      warning_autologout: false,
      countDownTimer: 600,
      countDownCounter: 0,

      loginPage: false
    };
  },
  // @TODO dead code
  // ONLY USED FOR DEBUGGING
  // watch: {
  //     show_sux_feedback: function(newValue) {
  //       console.log('success-feedback ist ' + newValue)
  //   },
  //     show_err_feedback: function(newValue) {
  //       console.log('error-feedback ist ' + newValue)
  //   }
  // },

  destroyed() {
    // when destroyed, clear the current interval
    clearInterval(this.countDownID);
  },

  methods: {
    /**
     * Function to resend the 'welcome'-Mail to the user with the certain ID
     *
     * @param {String} id ID of the user which should receive another welcome mail
     */
    resend_welcome(id) {
      // set proper header that Nextcloud accepts request
      let headers = {
        'OCS-APIRequest': true,
        'Content-Type': 'application/json',
        Authorization: this.basicAuthenticationstring,
        Accept: ['application/json', 'text/plain', '*/*']
      };
      // send welcome mail to user = 'id'
      fetch(this.urlprefix + 'ocs/v1.php/cloud/users/' + id + '/welcome', {
        method: 'POST',
        mode: 'cors',
        headers: headers,
        credentials: 'omit'
      })
        // if succeeded, call 'success'-function
        .then(() => {
          this.success(this.$ml.get('welcome_email_sent'), true);
        });
    },
    /**
     * @TODO sux to suc?
     * Function to update the password of a user
     *
     * @param {String} oldPassword The old password to authorize the change
     * @param {String} newPassword The value for the new password
     * @param {Function} suxCallback function to be called if request was succesfull
     * @param {Function} errCallback function to be called if request did fail
     */
    update_password(oldPassword, newPassword, suxCallback, errCallback) {
      // set proper header that Nextcloud accepts request
      let headers = {
        'OCS-APIRequest': true,
        'Content-Type': 'application/json',
        Authorization:
          'Basic ' + base64.encode(this.basicAuthentication.username + ':' + oldPassword),
        Accept: ['application/json', 'text/plain', '*/*']
      };
      // request to change password of user = 'basicAuthentication.username'
      fetch(this.urlprefix + 'ocs/v1.php/cloud/users/' + this.basicAuthentication.username, {
        method: 'PUT',
        mode: 'cors',
        headers: headers,
        credentials: 'omit',
        body: JSON.stringify({ key: 'password', value: newPassword })
      }).then(response => {
        response.json().then(response => {
          if (response.ocs.meta.status.toLowerCase() == 'ok') {
            this.basicAuthentication.password = newPassword;
            this.basicAuthenticationstring =
              'Basic ' +
              base64.encode(
                this.basicAuthentication.username + ':' + this.basicAuthentication.password
              );
            this.webdavInstance = createClient(this.urlprefix + 'remote.php/webdav/', {
              username: this.basicAuthentication.username, // username
              password: this.basicAuthentication.password // password
            });

            this.success(this.$ml.get('acc_info_changed'), true);

            if (suxCallback !== undefined) {
              suxCallback();
            }
          } else {
            this.error(response.ocs.meta.message, true);
            this.status.membercontrol_loading = false;

            if (errCallback !== undefined) {
              errCallback();
            }
          }
        });
      });
    },
    /**
     * As admin show the shared files of the selected Wolo
     *
     * @param {Object} wolo The Object with all informations about the wolo
     */
    select_admin(wolo) {
      if (this.currentPath !== '/') {
        this.get_dir_content('/');
      }
      // if 'wolo' is empty reset everything
      if (wolo.length === 0) {
        this.status.wolo_folders = false;
        this.selectedWolo = '';
        while (this.pathStack.length > 1) {
          this.pathStack.pop();
        }
        // if 'wolo' is not empty
      } else {
        this.selectedWolo = wolo.id;
        // @TODO BAD
        // @TODO added wolo.id to both, CHECK AGAIN"!!!!"!"
        if (this.pathStack.length === 1) {
          this.pathStack.push({ name: this.selectedWolo, link: '/' + wolo.id });
        } else {
          this.pathStack[1] = { name: this.selectedWolo, link: '/' + wolo.id };
        }
        this.status.wolo_folders = true;
      }
    },
    /**
     * API Request to update user informations
     * 'admin_' suffix implies its a function called by a subadmin (sozi)
     *
     * @param {String} userid ID of the member which should be updated
     * @param {String} key Attribute which should be updated
     * @param {String} value The new value for the attribute
     * @param {Function} suxCallback Function to be called if request was succesfull
     * @param {Function} errCallback Function to be called if request did fail
     */
    admin_update_member_helper(userid, key, value, suxCallback, errCallback) {
      // set proper header that Nextcloud accepts request
      let headers = {
        'OCS-APIRequest': true,
        'Content-Type': 'application/json',
        Authorization: this.basicAuthenticationstring,
        Accept: ['application/json', 'text/plain', '*/*']
      };
      // request to update 'key'-value of user = 'userid'
      fetch(this.urlprefix + 'ocs/v1.php/cloud/users/' + userid, {
        method: 'PUT',
        mode: 'cors',
        headers: headers,
        credentials: 'omit',
        body: JSON.stringify({ key: key, value: value })
      })
        // if succeeded
        .then(response => {
          if (suxCallback !== undefined) {
            suxCallback();
          }
          response.json().then(response => {
            // if request succeeded and response is ok
            if (response.ocs.meta.status.toLowerCase() === 'ok') {
              this.success(this.$ml.get('pw_changed'), true);
              this.stop_loading();
              this.status.membercontrol_loading = false;
              // if status is not 'ok' it failed
            } else {
              this.error(response.ocs.meta.message, true);
              this.stop_loading();
              this.status.membercontrol_loading = false;
              if (errCallback !== undefined) {
                errCallback();
              }
            }
          });
        })
        // if failed
        .catch(() => {
          if (errCallback !== undefined) {
            errCallback();
          }
        });
    },
    /**
     * Main function to update user informations; Calls 'admin_update_member_helper(...)'-function
     * 'admin_' suffix implies its a function called by a subadmin (sozi)
     *
     * @param {String} userid ID of the member which should be updated
     * @param {Object} updates Object contains the attributes which should be updated and the new values
     * @param {String} group Institution of the user
     */
    admin_update_member(userid, updates, group) {
      // @TODO this is no good style
      this.status.membercontrol_loading = true;
      let index = 0;
      let limit = 0;
      // for every value which should be changed add one to limit
      updates.id !== undefined ? (limit += 1) : () => {};
      updates.email !== undefined ? (limit += 1) : () => {};
      updates.password !== undefined ? (limit += 1) : () => {};
      // if the id should be updated (actually not possible with Nextcloud)
      if (updates.id !== undefined) {
        this.admin_update_member_helper(userid, 'displayname', updates.id, () => {
          index += 1;
          if (limit === index) {
            this.admin_get_group_members(group, () => {
              this.admin_get_members_infos(
                group,
                () => {
                  this.status.membercontrol_loading = false;
                },
                () => {
                  this.status.membercontrol_loading = false;
                }
              );
            });
          }
        });
      }
      // if the mail should be updated
      if (updates.email !== undefined) {
        // call the 'admin_update_member_helper'-function with 'email' as key
        this.admin_update_member_helper(userid, 'email', updates.email, () => {
          index += 1;
          if (limit === index) {
            this.admin_get_group_members(group, () => {
              this.admin_get_members_infos(
                group,
                () => {
                  this.status.membercontrol_loading = false;
                },
                () => {
                  this.status.membercontrol_loading = false;
                }
              );
            });
          }
        });
      }
      // if the password should be updated
      if (updates.password !== undefined) {
        // call the 'admin_update_member_helper'-function with 'password' as key
        this.admin_update_member_helper(userid, 'password', updates.password, () => {
          index += 1;
          if (limit === index) {
            this.admin_get_group_members(group, () => {
              this.admin_get_members_infos(
                group,
                () => {
                  this.status.membercontrol_loading = false;
                },
                () => {
                  this.status.membercontrol_loading = false;
                }
              );
            });
          }
        });
      }
    },
    /**
     * API Request to create a new user in a specific institution
     * 'admin_' suffix implies its a function called by a subadmin (sozi)
     *
     * @param {String} name ID of the user which should be created
     * @param {String} password Password for this user
     * @param {String} email Mail of the user
     * @param {String} group Institution in which the user should be added
     * @param {Function} suxCallback Function to be called if request was succesfull
     * @param {Function} errCallback Function to be called if request did fail
     */
    admin_create_new_user_in_group(name, password, email, group, suxCallback, errCallback) {
      // set proper header that Nextcloud accepts request
      let headers = {
        'OCS-APIRequest': true,
        'Content-Type': 'application/json',
        Authorization: this.basicAuthenticationstring,
        Accept: ['application/json', 'text/plain', '*/*']
      };
      // @dead code and '...' in comments?
      //fetch to stop sending session...
      this.status.membercontrol_loading = true;
      fetch(this.urlprefix + 'ocs/v1.php/cloud/users', {
        method: 'POST',
        mode: 'cors',
        headers: headers,
        credentials: 'omit',
        body: JSON.stringify({
          userid: name,
          // displayName: name + "dispalyy",
          password: password,
          email: email,
          groups: [group],
          quota: 'default'
        })
      })
        .then(response => {
          if (suxCallback !== undefined) {
            suxCallback();
          }
          response.json().then(response => {
            // if request was successful and response is ok
            if (response.ocs.meta.status.toLowerCase() === 'ok') {
              this.admin_get_group_members(group, () => {
                this.admin_get_members_infos(
                  group,
                  () => {
                    this.success(this.$ml.get('member_created_success').replace('{0}', name), true);
                    this.status.membercontrol_loading = false;
                  },
                  () => {
                    this.status.membercontrol_loading = false;
                  }
                );
              });
            } else {
              this.error(response.ocs.meta.message, true);
              this.status.membercontrol_loading = false;

              if (errCallback !== undefined) {
                errCallback();
              }
            }
          });
        })
        .catch(() => {
          if (errCallback !== undefined) {
            errCallback();
          }
        });
    },
    /**
     * API Request to remove a user from a group
     * admin_ suffix implies its a function called by a subadmin (sozi)
     *
     * @param {String} user ID of the user which should be removed
     * @param {String} group Institution from the user
     * @param {Function} suxCallback Function to be called if request was succesfull
     * @param {Function} errCallback Function to be called if request was errored
     * @deprecated  NC API does not allow our usecase
     * @TODO toast reponse
     */
    admin_remove_from_group(user, group, suxCallback, errCallback) {
      // set proper header that Nextcloud accepts request
      let headers = {
        'OCS-APIRequest': true,
        'Content-Type': 'application/json',
        Authorization: this.basicAuthenticationstring,
        Accept: ['application/json', 'text/plain', '*/*']
      };
      this.status.membercontrol_loading = true;
      fetch(this.urlprefix + 'ocs/v1.php/cloud/users/' + user + '/groups', {
        method: 'DELETE',
        mode: 'cors',
        headers: headers,
        credentials: 'omit',
        body: JSON.stringify({
          groupid: group
        })
      })
        .then(() => {
          if (suxCallback !== undefined) {
            suxCallback();
          }
          this.admin_get_group_members(group, () => {
            this.admin_get_members_infos(
              group,

              () => {
                this.status.membercontrol_loading = false;
              },
              () => {
                this.status.membercontrol_loading = false;
              }
            );
          });
        })
        .catch(() => {
          if (errCallback !== undefined) {
            errCallback();
          }
        });
    },
    /**
     * API Request to delete a sozi
     * 'admin_' suffix implies its a function called by a subadmin (sozi)
     *
     * @param {String} sozi The sozi which should be deleted
     * @param {String} group The group of this sozi
     * @param {Function} suxCallback Function to be called if request was succesfull
     * @param {Function} errCallback Function to be called if request was errored
     */
    admin_delete(sozi, group, suxCallback, errCallback) {
      // set proper header that Nextcloud accepts request
      let headers = {
        'OCS-APIRequest': true,
        'Content-Type': 'application/json',
        Accept: ['application/json', 'text/plain', '*/*']
      };
      this.status.membercontrol_loading = true;
      fetch(this.urlprefix + 'ocs/v1.php/cloud/users/' + sozi, {
        method: 'DELETE',
        mode: 'cors',
        headers: headers,
        credentials: 'omit'
      })
        .then(() => {
          if (suxCallback !== undefined) {
            suxCallback();
          }
          this.admin_get_group_members(group, () => {
            this.admin_get_members_infos(
              group,
              () => {
                this.status.membercontrol_loading = false;
              },
              () => {
                this.status.membercontrol_loading = false;
              }
            );
          });
        })
        .catch(() => {
          if (errCallback !== undefined) {
            errCallback();
          }
        });
    },
    /**
     * Forces Vue to rerender the object
     */
    forceRerender() {
      this.componentKey += 1;
    },
    /**
     * @TODO maybe change 'r' in a more meaningful var name
     * Rename a file
     *
     * @param {String} r The old name of the file
     * @param {String} newname The new name of the file
     */
    rename(r, newname) {
      this.start_loading();
      let newname_ = r.filename.substring(0, r.filename.length - r.basename.length) + newname;
      this.webdavInstance
        .moveFile(r.filename, newname_)
        .then(response => {
          this.get_dir_content(this.currentPath, this.stop_loading, this.stop_loading);
          // ml: Successfully renamed
          this.success(this.$ml.get('rename_success'), true);
        })
        .catch(response => {
          this.stop_loading();
          // ml: Error while renaming
          this.error(this.$ml.get('rename_error'), true);
        });
    },
    /**
     * Move a file or directory
     *
     * @param {Object} objectToMove All informations of the object which should be moved
     * @param {String} to Path of the place it should be moved to
     */
    move(objectToMove, destination) {
      // get the complete starting path
      let from = objectToMove.filename;
      // combine the destination with the filename to get the correct path
      let to = destination + '/' + objectToMove.basename;
      this.start_loading();
      this.webdavInstance
        .moveFile(from, to)
        .then(response => {
          this.get_dir_content(this.currentPath, this.stop_loading, this.stop_loading);
          // ml: Successfully renamed
          this.success(this.$ml.get('file_moved'), true);
        })
        .catch(response => {
          this.stop_loading();
          // ml: Error while renaming
          this.error(this.$ml.get('move_error'), true);
        });
    },
    /**
     * Delete a file or directory
     *
     * @param {Object} r File or folder to delete
     */
    remove(r) {
      this.start_loading();
      this.rows = this.rows.filter(rr => {
        return rr.filename != r.filename;
      });
      let path = this.currentPath + '/' + r.basename;
      this.webdavInstance
        .deleteFile(path)
        .then(() => {
          this.get_dir_content(
            this.currentPath,
            () => {
              // ml: Deleted successfully
              this.success(this.$ml.get('delete_success'), true);
            },
            this.stop_loading()
          );
        })
        .catch(() => {
          this.stop_loading();
          // ml: Error during deletion
          this.error(this.$ml.get('delete_error'), true);
        });
    },
    /**
     * Get the Quota of the user
     * @param {Function} callback A callback to another function
     */
    getQuota(callback) {
      this.webdavInstance
        .getQuota()
        .then(response => {
          this.quota.used = this.bytesToSize(response.used);
          if (typeof response.available === 'string') {
            this.quota.total = this.$ml.get('unlimited_quota');
            this.quota.free = this.$ml.get('unlimited_quota');
            this.quota.used_percent = '0';
          } else {
            this.quota.total = this.bytesToSize(response.available + response.used);
            this.quota.free = this.bytesToSize(response.available);
            this.quota.used_percent =
              (1 - response.available / (response.available + response.used)) * 100 + '';
            this.quota.used_percent = this.quota.used_percent.split('.')[0];
          }
          // TODO this is worse than ever ----- cc
          // this.success(this.$ml.get('quota_load_success') + 'whathtas', false);
          if (callback !== undefined) {
            callback();
          }
        })
        .catch(error => {
          // ml: Error loading quota
          this.error(this.$ml.get('quota_load_error') + error, true);
        });
    },
    /**
     * Updates the status of a shared object
     *
     * @param {String} shareid the ID of the shared object
     * @param {String} key The attribute which should be changed
     * @param {String} value The new value for the attribute
     */
    update_share(shareid, key, value) {
      let url =
        this.urlprefix + 'ocs/v2.php/apps/files_sharing/api/v1/shares/' + shareid + '?format=json';
      let data = {};
      data[key] = value;
      fetch(url, {
        method: 'PUT',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          Accept: ['application/json', 'text/plain', '*/*'],
          'Content-Type': 'application/json',
          'OCS-APIRequest': true,
          Authorization: this.basicAuthenticationstring
        },
        body: JSON.stringify(data)
      }).then(response => {
        this.response_handler(response, response => {
          response.json().then(data => {
            const index = this.shares.findIndex(share => share.id == data.ocs.data.id);
            if (index > -1) {
              this.shares[index] = data.ocs.data;
            }

            this.bind_share_to_rows();

            this.stop_loading();
            this.success(this.$ml.get('save_success'), true);
          });
        });
      });
    },
    /**
     * Function to share a file
     *
     * @param {Object} file The file which should be shared
     * @param {Object} permissions The permissions with which the file should be shared
     * @param {Object} selectedInstitution The selected institution to share with
     * @param {String} date The date the share should expire
     * @param {String} password The password the share is saved with
     */
    share(file, permissions, selectedInstitution, date, password) {
      let url =
        this.urlprefix + 'ocs/v2.php/apps/files_sharing/api/v1/shares?path=' + file.filename;
      let permissionstring = '1';
      if (permissions.password && password !== undefined) {
        url = url + '&password=' + password;
      }
      if (permissions.pubload) {
        url = url + '&publicUpload=true';
      }
      if (permissions.exdate && date !== undefined) {
        url = url + '&expireDate=' + date;
      }
      if (!permissions.link) {
        if (selectedInstitution !== undefined && !permissions.email && !permissions.link) {
          if (
            selectedInstitution.shareWith.includes('CLIENT') ||
            selectedInstitution.shareWith.includes('client')
          ) {
            // no sharing of control groups
            return;
          }
        }
      }
      // link share
      if (permissions.link) {
        url = url + '&shareType=3';
      } else if (permissions.email && selectedInstitution.shareWith !== undefined) {
        // share with id / group
        url = url + '&shareType=4&shareWith=' + selectedInstitution.shareWith;
      } else {
        url = url + '&shareType=1&shareWith=' + selectedInstitution.shareWith;
      }
      if (permissions.edit) {
        permissionstring = '7';
      } else {
        permissionstring = '1';
      }
      url = url + '&permissions=' + permissionstring;
      fetch(url, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          Accept: ['application/json', 'text/plain', '*/*'],
          'Content-Type': 'application/json',
          'OCS-APIRequest': true,
          Authorization: this.basicAuthenticationstring
        }
      }).then(response => {
        this.response_handler(response, response => {
          response.json().then(data => {
            this.shares = data.ocs.data;

            this.getShares(() => {
              this.bind_share_to_rows();
            });
            this.stop_loading();
            // ml: Sharing successfully interrupted
            this.success(this.$ml.get('new_share_success'), true);
          });
        });
      });
    },
    /**
     * Deletes a share
     *
     * @param {Object} share ID of the share which should be deleted
     */
    delete_share(share) {
      this.start_loading();

      fetch(this.urlprefix + 'ocs/v2.php/apps/files_sharing/api/v1/shares/' + share.id, {
        method: 'DELETE',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'OCS-APIRequest': true,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: this.basicAuthenticationstring
        }
      }).then(response => {
        this.response_handler(
          response,

          () => {
            this.getShares(() => {
              this.bind_share_to_rows();
            });

            this.stop_loading();
            // ml: Sharing has been interrupted
            this.success(this.$ml.get('end_sharing_success'), false);
          }
        );
      });
    },
    /**
     * Only if you look as Wolo for a institution; Searches in the Nextcloud for if a institution fits the query-string
     *
     * @param {String} query The string which should be searched for
     */
    sharesearch(query) {
      fetch(
        this.urlprefix +
          'ocs/v2.php/apps/files_sharing/api/v1/sharees?search=' +
          query +
          "&lookup=false&perPage=10&itemType='group'",
        {
          method: 'GET',
          mode: 'cors',
          credentials: 'omit',
          headers: {
            'OCS-APIRequest': true,
            Accept: ['application/json', 'text/plain', '*/*'],
            'Content-Type': 'application/json',
            Authorization: this.basicAuthenticationstring
          }
        }
      )
        .then(response => {
          response.json().then(data => {
            let groups = data.ocs.data.groups;
            let index = 0;
            let remover = [];
            groups.forEach(group => {
              if (group.label.includes('CLIENT') || group.label.includes('admin')) {
                remover.push(index);
              }
              index += 1;
            });
            remover.forEach(rm => {
              delete groups[rm];
            });
            this.shareSearchResults = groups;
            // ml: Shared documents loaded successfully
            this.success(this.$ml.get('shared_load_success') + response, false);
          });
        })
        .catch(response => {
          // ml: Error loading shared documents
          this.error(this.$ml.get('shared_load_error') + response);
        });
    },
    /**
     * Get the informations of the users which are in a certain institution
     * 'admin_' suffix implies its a function called by a subadmin (sozi)
     *
     * @param {String} group The institution which is checked
     */
    admin_get_members_infos(group, suxCallback, errCallback) {
      let intarray = undefined;
      if (group === this.woloGroup) {
        intarray = this.woloGroups;
      }
      let index = 0;
      if (intarray !== undefined) {
        if (intarray.length > 0) {
          intarray.forEach(member => {
            fetch(this.urlprefix + 'ocs/v1.php/cloud/users/' + member.id, {
              mode: 'cors',
              credentials: 'omit',
              method: 'GET',
              headers: {
                'OCS-APIRequest': true,
                Accept: ['application/json', 'text/plain', '*/*'],
                'Content-Type': 'application/json',
                Authorization: this.basicAuthenticationstring
                // dont know if thins fix rist load not admin erroe
              }
            }).then(response => {
              response.json().then(data => {
                data.ocs.data.quota_percent = 0;

                data.ocs.data.fileamount = this.rows.filter(
                  r => r.owner == data.ocs.data.id
                ).length;

                if (data.ocs.data.fileamount == 0) {
                  console.log(member.id + ' hat nichts geshared');
                }

                data.ocs.data.passwortdummy = '***************';

                if (group == this.woloGroup) {
                  this.woloGroups[index] = data.ocs.data;
                }

                if (index + 1 == intarray.length) {
                  this.woloGroups = this.woloGroups.sort(this.compare_member);
                  if (suxCallback !== undefined) {
                    suxCallback();
                  } else if (errCallback !== undefined) {
                    errCallback();
                  }
                }
                index += 1;
              });
            });
          });
        } else {
          if (suxCallback !== undefined) {
            suxCallback();
          }
        }
      }
    },
    /**
     * Get all users which are in a certain institution
     * 'admin_' suffix implies its a function called by a subadmin (sozi)
     *
     * @param {String} group The institution which is checked
     */
    admin_get_group_members(group, suxCallback, errCallback) {
      fetch(this.urlprefix + 'ocs/v1.php/cloud/groups/' + group, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'OCS-APIRequest': true,
          Accept: ['application/json', 'text/plain', '*/*'],
          'Content-Type': 'application/json',
          Authorization: this.basicAuthenticationstring
        }
      })
        .then(response => {
          response.json().then(data => {
            if (data.ocs.data.users !== undefined) {
              if (group.includes('CLIENT') || group.includes('client')) {
                this.woloGroups = [];
                data.ocs.data.users.forEach(user => {
                  this.woloGroups.push({ id: user });
                });
              }
              if (suxCallback !== undefined) {
                suxCallback();
              }
            }
          });
        })
        .catch(() => {
          if (errCallback !== undefined) {
            errCallback();
          }
        });
    },
    /**
     * @TODO this is not really an error callback, more a callback triggered if not (sub) admin
     * Get all informations of a certain user
     * 'admin_' suffix implies its a function called by a subadmin (sozi)
     *
     * @param {String} username ID from which the information should be retrieved
     * @param {Function} suxCallback Function to be called if request was succesfull
     * @param {Function} errCallback Function to be called if request was errored
     */
    admin_get_account_information(username, suxCallback, errCallback) {
      fetch(this.urlprefix + 'ocs/v1.php/cloud/users/' + username, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'OCS-APIRequest': true,
          Accept: ['application/json', 'text/plain', '*/*'],
          'Content-Type': 'application/json',
          Authorization: this.basicAuthenticationstring
        }
      })
        .then(response => {
          response.json().then(data => {
            this.woloGroup = '';
            let groups = data.ocs.data.groups;
            let subadmins = data.ocs.data.subadmin;
            this.status.email =
              data.ocs.data.email === '' ? this.$ml.get('no_email') : data.ocs.data.email;
            this.status.username = data.ocs.data.id;

            this.status.language = data.ocs.data.language;
            this.checkLanguageSettings();

            if (data.ocs.meta.statuscode == 998) {
              console.log('INTERCAHNGE ACCIDENTTS!!!!!!!!!!!!!');
            }
            if (subadmins.length >= 2) {
              console.log('this should not happen and produce an error message');
            }
            if (groups.length != 0) {
              console.log('this should not happen and produce an error message');
            }
            if (subadmins.length > 0) {
              console.log('this should not happen and produce an error message');
              // check all subadmins for this account
              subadmins.forEach(subadmin => {
                // there is a subadmin privileges for the
                if (subadmin.includes('CLIENT') || subadmin.includes('CLIENT')) {
                  this.status.iswoloadmin = true;
                  this.woloGroup = subadmin;
                }
              });
              if (suxCallback !== undefined) {
                suxCallback();
              }
            } else {
              if (groups[0].includes('CLIENT')) {
                this.group = groups[0].replace('CLIENT', '');
              }
              if (errCallback !== undefined) {
                errCallback();
              }
            }
          });
        })
        .catch(error => {
          if (errCallback !== undefined) {
            errCallback();
          }
        });
    },
    /**
     * Get everything which is shared with the admin
     *
     * @param {Function} suxCallback Function to be called if request was succesfull
     * @param {Function} errCallback Function to be called if request was errored
     */
    getShares(suxCallback, errCallback) {
      this.start_loading();
      fetch(this.urlprefix + 'ocs/v2.php/apps/files_sharing/api/v1/shares?format=json', {
        method: 'GET',
        headers: { 'OCS-APIRequest': true, Authorization: this.basicAuthenticationstring },
        mode: 'cors',
        credentials: 'omit'
      })
        .then(response => {
          if (response.status != 200) {
            //alarm
            if (errCallback !== undefined) {
              errCallback();
            }
            // ml: Error loading shared documents
            this.error(this.$ml.get('shared_load_error') + response.message);
          }
          response.json().then(json => {
            this.shares = json.ocs.data;
            if (suxCallback !== undefined) {
              suxCallback();
            }
            // ml: Shared documents loaded successfully
            this.success(this.$ml.get('shared_load_success') + json, false);
          });
        })
        .catch(response => {
          if (errCallback !== undefined) {
            errCallback();
          }
          // ml: Error loading shared documents
          this.error(this.$ml.get('shared_load_error') + response.reponse.message);
        });
    },
    /**
     * Refreshes/Loads the site again
     */
    refresh() {
      this.getShares(() => {
        this.getQuota(
          () => {
            this.status.logged_in = true;
            this.get_dir_content('/');
            this.admin_get_account_information(
              this.basicAuthentication.username,
              () => {
                this.admin_get_group_members(this.woloGroup, () => {
                  this.admin_get_members_infos(this.woloGroup, () => {
                    this.status.wolo_member_loaded = true;
                    this.stop_loading();
                  });
                });
              },
              () => {
                this.stop_loading();
              }
            );
          },
          () => {
            this.status.logged_in = false;
            // ml: Login not successful
            this.error(this.$ml.get('login_error'));
          }
        );
      });
    },
    /**
     * Refreshes/Loads the specific folder again
     *
     * @param {String} folder The folder in which the refresh should be
     */
    refresh_at_folder(folder) {
      this.getShares(() => {
        this.getQuota(
          () => {
            this.status.logged_in = true;
            this.get_dir_content(folder);
            this.admin_get_account_information(
              this.basicAuthentication.username,
              () => {
                this.admin_get_group_members(this.woloGroup, () => {
                  this.admin_get_members_infos(this.woloGroup, () => {
                    this.status.wolo_member_loaded = true;
                    this.stop_loading();
                  });
                });
              },
              () => {
                this.stop_loading();
              }
            );
          },
          () => {
            this.status.logged_in = false;
            // ml: Login not successful
            this.error(this.$ml.get('login_error'));
          }
        );
      });
    },
    /**
     * Function to upload files
     *
     * @param {Object} files All the files to upload
     */
    upload(files) {
      let seize = files.length;
      let counter = 0;
      // this.start_loading();
      let prefix = '';
      this.currentPath.slice(-1) === '/' ? (prefix = '') : (prefix = '/');
      files.forEach(file => {
        fetch(this.urlprefix + 'remote.php/webdav/' + this.currentPath + prefix + file.name, {
          method: 'PUT',
          body: file,
          mode: 'cors',
          headers: { 'OCS-APIRequest': true, Authorization: this.basicAuthenticationstring },
          credentials: 'omit'
        })
          .then(response => {
            if (response.ok) {
              counter += 1;
              this.success(counter + ' files uploaded', true);
              if (counter === seize) {
                this.status.uploading = false;
                this.get_dir_content(this.currentPath, this.stop_loading, this.stop_loading);
              }
            } else {
              this.error(this.$ml.get('upload_error') + ' ' + response.statusText, true);
              this.status.uploading = false;
              this.get_dir_content(this.currentPath, this.stop_loading, this.stop_loading);
            }
          })
          .catch(response => {
            // ml: Upload failed
          });
      });
      if (seize === 0) {
        this.error(this.$ml.get('empty_upload'), true);
        this.status.uploading = false;
        this.get_dir_content(this.currentPath, this.stop_loading, this.stop_loading);
      }
      this.files = [];
    },
    /**
     * This function downloads a file or directory
     *
     * @param {Object} obj Object which should be downloaded
     */
    download(obj) {
      this.start_loading();
      let path = obj.filename;
      let filename = '';
      // if the 'currentPath' is '/' we do not need to change the length
      if (this.currentPath === '/') {
        filename = path.substring(this.currentPath.length, path.length);
        // else add one to 'currentPath'-length to also get the last '/'
      } else {
        filename = path.substring(this.currentPath.length + 1, path.length);
      }
      // directories can not be downloaded so throw error
      if (obj.type === 'directory') {
        // ml: Sorry, this folder cannot be downloaded right now
        this.error(this.$ml.get('download_folder_error'), true);
        // if file fetch path
      } else if (obj.type === 'file') {
        fetch(this.urlprefix + 'remote.php/webdav' + path, {
          mode: 'cors',
          credentials: 'omit',
          headers: { 'OCS-APIRequest': true, Authorization: this.basicAuthenticationstring },
          responseType: 'blob'
        })
          // request succeeded
          .then(response => response.blob())
          .then(imageblobl => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(imageblobl);
            link.download = filename;
            link.click();
            URL.revokeObjectURL(link.href);
            this.stop_loading();
            // ml: Download completed
            this.success(this.$ml.get('download_finished'), false);
          })
          // request failed
          .catch(response => {
            this.stop_loading();
            // ml: Sorry, the download was not successful
            this.error(this.$ml.get('download_error') + response, true);
          });
      }
    },
    /**
     * Function to select a Object
     *
     * @param {Object} file The Object which is selected
     */
    select(file) {
      // if the file is a directory get the content of the directory
      if (file.type === 'directory') {
        this.currentSharedFolderIsUploadAble = file.props.permissions.includes('CK');
        this.get_dir_content(file.filename, this.stop_loading, this.stop_loading);
      }
    },
    /**
     * Create a directory
     *
     * @param {String} path Path where the directory should be created
     */
    mkdir(path) {
      this.start_loading();
      this.webdavInstance
        .createDirectory(this.currentPath + '/' + path)
        // request succeeded
        .then(() => {
          // get the content of the current path
          this.get_dir_content(
            this.currentPath,
            () => {
              // ml: New folder {0} has been created
              this.success(this.$ml.get('new_folder_created_success').replace('{0}', path), true);
              this.stop_loading();
            },
            this.stop_loading
          );
        })
        // failed request
        .catch(response => {
          // ml: The folder could not be created
          this.error(this.$ml.get('new_folder_created_error') + response);
        });
    },
    /**
     * Get the path of the parent folder
     */
    parent() {
      // if the path is not '/' there is a parent
      if (this.currentPath != '/') {
        let path = this.currentPath.substring(0, this.currentPath.lastIndexOf('/'));
        this.get_dir_content(path === '' ? '/' : path);
        // else reset the values if logged in as a admin
      } else if (this.status.iswoloadmin) {
        this.select_admin('');
        this.refresh();
      }
    },
    /**
     * Function to logout a user, resets important values
     */
    logout() {
      this.shares = [];
      this.rows = [];
      this.currentPath = undefined;
      this.status.iswoloadmin = false;
      this.woloGroups = [];
      this.quota.used = undefined;
      delete this.webdavInstance;
      this.basicAuthentication.username = '';
      this.basicAuthentication.password = '';
      this.webdavInstance = undefined;
      this.status.logged_in = false;
      this.status.files_loaded = false;
      this.feedback_message = '';
      clearInterval(this.countDownID);
      Object.assign(this.$data, this.$options.data.call(this));
    },
    /**
     * helper to check if fetch response from NC was succesfull and handle toast (response message)
     *
     * @param {promise} response promise with response date including status code.. see fetch
     * https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch for more details
     * @param {function(response):void} suxCallback function trigger after a succefull fetch
     * @param {function()} errCallback function triggered after a errored fetch
     */
    response_handler(response, suxCallback, errCallback) {
      // if response.status is between 200-299 and ok its a success
      if (response.status % 200 < 100 && response.ok) {
        if (suxCallback !== undefined) {
          suxCallback(response);
        }
        // if response.status is not in the 200-range or ok it failed
      } else {
        response.json().then(data => {
          console.log('*****************************************');
          console.log('*****************************************');
          console.log('*****************************************');
          console.log('*****************************************');
          console.log('BACKEND error: ' + data.ocs.meta.message);
          console.log('*****************************************');
          console.log('*****************************************');
          console.log('*****************************************');
          console.log('*****************************************');
          this.error(data.ocs.meta.message, true, errCallback);
        });
      }
    },
    /**
     * Gives feedback when action was success
     *
     * @param {String} feedback_message The feedback-message of the action
     * @param {Boolean} toast If true post a toast
     */
    success(feedback_message, toast) {
      // enable toast if toast parameter is true
      if (toast === true) {
        this.show_err_feedback = false;
        this.feedback_message = feedback_message;
        this.show_sux_feedback = true;
      }
      // set timeout to close after certain time
      setTimeout(() => (this.show_sux_feedback = false), this.timeout);
    },
    /**
     * Gives feedback when action failed
     *
     * @param {String} feedback_message The feedback-message of the action
     * @param {Boolean} toast If true post a toast
     * @param {Function} callback
     */
    error(feedback_message, toast, callback) {
      if (callback !== undefined) {
        callback();
      }
      // enable toast if toast parameter is true
      if (toast) {
        this.show_sux_feedback = false;
        this.feedback_message = feedback_message;
        this.show_err_feedback = true;
      }
      // set timeout to close after certain time
      setTimeout(() => (this.show_err_feedback = false), this.timeout);
    },
    /**
     * Sets the loading status true
     */
    start_loading() {
      this.status.loading = true;
      this.resetCountDown();
    },
    /**
     * Sets the loading status false and calls the 'forceRerender()'-function
     */
    stop_loading() {
      this.status.loading = false;
      this.forceRerender();
    },
    /**
     * Get the thumbnail of an object
     *
     * @param {Object} obj Object of which a thumbnail should be created
     */
    get_thumbnail(obj) {
      let path = obj.filename;
      obj.thumb = false;
      if (obj.type === 'file') {
        let splitties = obj.filename.split('.');
        if (['jpg', 'png', 'gif'].includes(splitties[splitties.length - 1])) {
          // if the object is a file and a picture get the thumbnail
          obj.thumb = true;
          obj.thumblink = 'nextcloud/index.php/apps/files/api/v1/thumbnail/32/32' + path;
          obj.thumblinkbig = 'nextcloud/index.php/apps/files/api/v1/thumbnail/1024/1024' + path;
        }
      }
    },
    /**
     * If there are shared objects, compare every row with the array with the shared objects; If they match set shared-status of this row true
     */
    bind_share_to_rows() {
      if (this.shares !== undefined) {
        // iterate over each row
        this.rows.forEach(row => {
          row.shared = false;
          row.sharedVal = [];
          // iterate over each share
          this.shares.forEach(share => {
            let path = share.path;
            // if row and share fit together combine them
            if (row.filename === path) {
              row.shared = true;
              row.sharedVal.push(share);
            }
          });
        });
        this.forceRerender();
        //or in file components
      }
    },
    /** @TODO dead code
     * Get the content of a directory
     *
     * @param {String} path The path of the directory
     * @param {Function} suxCallback Function to be called if request was succesfull
     * @param {Function} errCallback Function to be called if request was errored
     */
    get_dir_content(path, suxCallback, errCallback) {
      this.status.files_loaded = false;
      this.webdavInstance
        .getDirectoryContents(path, {
          data: `<?xml version="1.0"?>
                  <d:propfind  xmlns:d="DAV:" xmlns:oc="http://owncloud.org/ns" xmlns:nc="http://nextcloud.org/ns">
                    <d:prop>
                          <d:getlastmodified />
                          <d:getetag />
                          <d:getcontenttype />
                          <d:resourcetype />
                          <oc:fileid />
                          <oc:permissions />
                          <oc:size />
                          <d:getcontentlength />
                          <nc:has-preview />
                          <oc:favorite />
                          <oc:comments-unread />
                          <oc:owner-display-name />
                          <oc:share-types />
                          <nc:contained-folder-count />
                          <nc:contained-file-count />
                    </d:prop>
                  </d:propfind>`,
          details: true
        })
        // if request succeeded
        .then(data => {
          this.currentPath = path;
          // @TODO welcome to the ugly code parade
          let temp = this.currentPath.split('/');
          temp = temp.filter(function (el) {
            return el != '';
          });
          let acc = '';
          this.pathStack = [{ name: 'Start', link: '/' }];
          this.selectedWolo
            ? this.pathStack.push({ name: this.selectedWolo, link: '/' + this.selectedWolo })
            : () => {};
          // @TODO better name than 'f'
          temp.forEach(f => {
            acc = acc + '/' + f;
            acc = acc.replace('//', '/');
            this.pathStack.push({ name: f, link: acc });
          });
          this.rows = data.data.sort(this.compare_rows);
          this.rows.forEach(row => {
            row.hasowner = false;
            if (row.props !== undefined) {
              if (
                row.props['owner-display-name'] !== undefined &&
                row.props['owner-display-name'].length > 0
              )
                row.owner = row.props['owner-display-name'];
              row.hasowner = true;
            }
            this.get_thumbnail(row);
            row.size = this.bytesToSize(row.size);
          });
          this.bind_share_to_rows();
          this.getQuota();
          if (suxCallback !== undefined) {
            suxCallback();
          } else {
            console.log('Es wurde nichts freigegeben');
          }
          // this.success(this.$ml.get('load_contents_successful'), false);
          this.status.files_loaded = true;
        })
        // if request failed
        .catch(response => {
          if (errCallback !== undefined) {
            errCallback();
          }
          // ml: Folder not available
          this.error(this.$ml.get('folder_unavailable') + response);
        });
    },
    /**
     * @TODO change var names to more meaningful ones?
     * Compares two objects
     *
     * @param {Object} a Object which should be compared with 'b'
     * @param {Object} b Object which should be compared with 'a'
     */
    compare_rows(a, b) {
      if (a.type === 'directory' && b.type === 'file') {
        return -1;
      } else if (b.type === 'directory' && a.type === 'file') {
        return 1;
      } else if (b.type === a.type) {
        if (a.basename.toUpperCase() < b.basename.toUpperCase()) {
          return -1;
        } else if (a.basename.toUpperCase() > b.basename.toUpperCase()) {
          return 1;
        } else {
          return 0;
        }
      } else {
        return 0;
      }
    },
    /**
     * @TODO change var names to more meaningful ones
     * Compares two members
     *
     * @param {Object} a member which should be compared with 'b'
     * @param {Object} b member which should be compared with 'a'
     */
    compare_member(a, b) {
      if (a.id.toUpperCase() < b.id.toUpperCase()) {
        return -1;
      } else if (a.id.toUpperCase() > b.id.toUpperCase()) {
        return 1;
      } else {
        return 0;
      }
    },
    /**
     * Function to login a user
     * @TODO dead code
     */
    login() {
      this.feedback_message = '';
      this.show_sux_feedback = false;
      this.show_err_feedback = false;
      this.loginPage = true;

      if (this.basicAuthentication.username.includes('@')) {
        this.start_loading();
        setTimeout(() => {
          this.error(this.$ml.get('email_forbidden'), true);
          this.stop_loading();
        }, 1000);
        return;
      }

      this.webdavInstance = createClient(this.urlprefix + 'remote.php/webdav/', {
        username: this.basicAuthentication.username, // username
        password: this.basicAuthentication.password // password
      });
      // no use for clear text pw storage, rest will be handled via tokens
      this.start_loading();
      this.basicAuthenticationstring =
        'Basic ' +
        base64.encode(this.basicAuthentication.username + ':' + this.basicAuthentication.password);
      // inital quota request to set tokens.
      this.getShares(
        () => {
          this.getQuota(
            // if login succeeded
            () => {
              this.status.logged_in = true;
              this.get_dir_content('/');
              this.admin_get_account_information(
                this.basicAuthentication.username,
                // getting acc information succeeded
                () => {
                  this.admin_get_group_members(this.woloGroup, () => {
                    this.admin_get_members_infos(this.woloGroup, () => {
                      this.status.wolo_member_loaded = true;
                      this.stop_loading();
                    });
                  });
                },
                // getting acc infos failed
                () => {
                  this.stop_loading();
                }
              );
              // this.username = '';
              this.basicAuthentication.password = '';
            },
            // if login did not succeed
            () => {
              // this.username = '';
              this.basicAuthentication.password = '';
              this.status.logged_in = false;
              this.status.loading = false;
              // ml: Login not successful
              this.error(this.$ml.get('login_error'), true);
            }
          );
        },
        // if login did not succeed
        () => {
          this.basicAuthentication.password = '';
          this.status.logged_in = false;
          this.status.loading = false;
          // ml: Login not successful
          this.error(this.$ml.get('login_error'), true);
        }
      );
    },
    /**
     * Starts the countdown for the Auto-Logout
     */
    startCountDown() {
      this.countDownCounter = this.countDownTimer;
      // call every second the 'reduceCounter'-Function
      this.countDownID = setInterval(this.reduceCounter, 1000);
    },
    /**
     * Reduces the countdown-counter
     */
    reduceCounter() {
      // as long as counter not at 0 count down
      if (this.countDownCounter > 1) {
        if (this.countDownCounter < 30 && !this.warning_autologout) {
          this.warning_autologout = true;
        }
        this.countDownCounter--;
      } else {
        clearInterval(this.countDownID);
        this.logout();
      }
    },
    /**
     * Resets the countdown
     */
    resetCountDown() {
      // first clear the intervall
      clearInterval(this.countDownID);
      // reset pop-up
      this.warning_autologout = false;
      // start new countdown
      this.startCountDown();
    },
    /**
     * Synchronises the LanguageSettings of the frontend with the backend
     */
    checkLanguageSettings() {
      var convBackendToFrontend = this.convertLanguage(this.status.language);
      var convFrontendToBackend = this.convertLanguage(this.$ml.current);
      // if logging in and the frontend- and Nextcloud-language of the user are the same, do nothing
      if (
        this.loginPage &&
        (this.$ml.current != 'Deutsch' ||
          (this.$ml.current === 'Deutsch' && this.$ml.current === convBackendToFrontend))
      ) {
        this.loginPage = false;
        // if logging in and the frontend-language is on default and that is not the Nextcloud-language of the user, change it to the Nextcloud-language
      } else if (
        this.loginPage &&
        this.$ml.current === 'Deutsch' &&
        this.$ml.current != convBackendToFrontend
      ) {
        this.$ml.change(convBackendToFrontend);
        this.loginPage = false;
        // if already logged in and the language gets changed, update the Nextcloud-language of the user
      } else if (!this.loginPage && convFrontendToBackend != this.status.language) {
        this.admin_update_member_helper(
          this.status.username,
          'language',
          convFrontendToBackend,
          () => {
            this.admin_get_group_members(group, () => {
              this.admin_get_members_infos(
                group,
                () => {
                  this.status.membercontrol_loading = false;
                },
                () => {
                  this.status.membercontrol_loading = false;
                }
              );
            });
          }
        );
      }
    },
    /**
     * Convert the word from MultiLanguage-form to Nextcloud-form or vice versa
     *
     * @param {String} lang The word which should be converted
     */
    convertLanguage(lang) {
      // @TODO add new languages here
      // ugly af
      if (lang === 'de') {
        lang = 'Deutsch';
        return lang;
      } else if (lang === 'Deutsch') {
        lang = 'de';
        return lang;
      } else if (lang === 'en') {
        lang = 'English';
        return lang;
      } else if (lang === 'English') {
        lang = 'en';
        return lang;
      } else if (lang === 'fr') {
        lang = 'Français';
        return lang;
      } else if (lang === 'Français') {
        lang = 'fr';
        return lang;
      } else if (lang === 'tr') {
        lang = 'Türkçe';
        return lang;
      } else if (lang === 'Türkçe') {
        lang = 'tr';
        return lang;
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.bg {
  background: url(./../assets/bg.jpg);
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  width: 100vw;
  height: 100vh;
}

.bg-blur {
  background: url(./../assets/bg-header-blurred.jpg);
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  width: 100vw;
  height: 100vh;
}
</style>
