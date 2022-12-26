<template>
  <div class="global" data-app>
    <div class="header-bar">
      <img
        id="header-key"
        alt="Cloud fuer wohnungslose Menschen"
        src="./../assets/cloud-logo.png"
      />
      <img
        v-if="currentPath === '/'"
        id="header-key-mobile"
        alt="Cloud fuer wohnungslose Menschen"
        src="./../assets/cloud-key.png"
        @click="$emit('refresh')"
      />
      <div v-if="currentPath != '/'" class="mobile-folders">
        <v-icon class="mobile-folders-back" @click="$emit('parent')"> mdi-arrow-left </v-icon>
        <div v-for="(p, index) in pathStack" v-bind:key="p.link + index">
          <div v-if="index + 1 === pathStack.length">
            {{ p.name }}
          </div>
        </div>
      </div>
      <!-- Password reset -->
      <password-reset
        class="pw-reset-desktop"
        :status="status"
        :group="group === undefined ? woloGroup.replace('CLIENT', '') : group"
        @change_pw="change_pw"
        @checkLanguageSettings="checkLanguageSettings"
      >
      </password-reset>
      <password-reset
        class="pw-reset-mobile"
        :status="status"
        :group="group === undefined ? woloGroup.replace('CLIENT', '') : group"
        @change_pw="change_pw"
        @checkLanguageSettings="checkLanguageSettings"
      >
      </password-reset>
      <!-- COUNTDOWN AUTOLOGOUT NIKO -->
      <!-- // MLME -->
      <!-- <div id="autologout" class="logout_counter_desktop">
        <p v-html="$ml.get('logout_countdown')"></p>
        <p>{{ countDownCounter }}</p>
      </div> -->
      <div v-if="status.logged_in" class="logout">
        <v-btn class="logout-desktop" style="color: #fff" color="#003F69" @click="logout">
          <v-icon> mdi-logout </v-icon>
          <p v-html="$ml.get('logout_button')"></p>
        </v-btn>
        <v-btn class="logout-mobile" style="color: #fff" color="#003F69" fab @click="logout">
          <v-icon> mdi-logout </v-icon>
        </v-btn>
      </div>
    </div>
    <div class="documents">
      <!-- Documents Header -->
      <div class="documents-header">
        <!-- Breadcrumbs -->
        <div class="folders">
          <div class="folder">
            <span style="margin-left: 2px" @click="$emit('refresh_at_folder', currentPath)">
              <v-icon> mdi-refresh </v-icon>
            </span>
          </div>
          <!-- FIRST LEVEL OVERVIEW -->
          <div v-if="pathStack.length >= 1" class="folder">
            <!-- ml: Your Clients -->
            <span
              v-if="status.iswoloadmin"
              style="margin-left: 2px; vertical-align: -3px"
              v-html="$ml.get('your_clients')"
              @click="select_admin(''), $emit('refresh')"
            >
            </span>
            <!-- ml: Your Documents -->
            <span
              v-if="!status.iswoloadmin"
              style="margin-left: 2px; vertical-align: -3px"
              v-html="$ml.get('your_documents')"
              @click="(currentPath = '/'), $emit('refresh')"
            >
            </span>
          </div>
          <v-icon v-if="currentPath != '/'" class="folder back" @click="$emit('parent')">
            mdi-arrow-left
          </v-icon>
          <!--  WOLO  -->
          <div
            v-if="
              pathStack.length >= 2 &&
              status.iswoloadmin &&
              selectedWolo !== '' &&
              selectedWolo !== undefined
            "
            class="folder"
            @click="$emit('get_dir_content', '/')"
          >
            <span style="margin-left: 2px; vertical-align: -3px">
              {{ truncate(selectedWolo, 100) }}
            </span>
          </div>
          <!--  LAST FOLDER  -->
          <div v-if="currentPath != '/' && pathStack.length > 1" class="folder">
            <span style="margin-left: 2px; vertical-align: -3px">
              {{ truncate(pathStack[pathStack.length - 1].name, 100) }}
            </span>
          </div>
          <!-- @TODO Alte Breadcrumbs // Erstmal behalten, falls User Tests die neuen nicht mögen //
        <div class="folder" v-for="(p, index) in pathStack" :key="p.link + index">

            <v-icon v-if="iswoloadmin && index === 1" @click="select_admin({ id: active_wolo })">mdi-account</v-icon>

            <v-icon
              v-if="!status.iswoloadmin || (status.iswoloadmin && index > 1)"
              @click="select({ type: 'directory', filename: p.link })"
              >mdi-folder</v-icon

            <span v-if="index > 0" style="margin-left:2px;vertical-align: -3px;">{{ truncate(p.name, 100) }}</span>
          </div>-->
        </div>
        <!-- Upload -->
        <Uploaderpage
          v-if="
            !status.iswoloadmin ||
            (status.iswoloadmin && currentPath != '/' && currentSharedFolderIsUploadAble)
          "
          :path="currentPath"
          @error="
            (a, b, c, d, e) => {
              $emit('error', a, b, c, d, e);
            }
          "
          @upload="
            files => {
              status.uploading = true;
              uploading_files = files;
              $emit('upload', files);
            }
          "
        >
        </Uploaderpage>
        <!-- create new wolo -->
        <div v-if="status.iswoloadmin" class="create-folder">
          <v-dialog v-model="dialog_admin_wolo_add" width="600px">
            <template v-slot:activator="{ on, attrs }">
              <v-btn class="create-folder-button" v-bind="attrs" v-on="on">
                <v-icon> mdi-account-multiple-plus </v-icon>
                <!-- ml: Create a new client -->
                <span v-html="$ml.get('create_wolo')"></span>
              </v-btn>
            </template>
            <v-card>
              <v-card-title>
                <!-- ml: Create a new client -->
                <h3 v-html="$ml.get('create_wolo')"></h3>
              </v-card-title>
              <v-card-text>
                <CreateMember
                  :institution="woloGroup"
                  :loading="status.membercontrol_loading"
                  :shown="dialog_admin_wolo_add"
                  @admin_create_new_user_in_group="
                    (a, b, c, d) => {
                      (dialog_admin_wolo_add = false),
                        $emit('admin_create_new_user_in_group', a, b, c, d);
                    }
                  "
                >
                </CreateMember>
              </v-card-text>
              <v-card-actions>
                <v-divider></v-divider>
                <v-btn v-html="$ml.get('cancel')" text @click="dialog_admin_wolo_add = false">
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </div>
        <!-- Ordner erstellen -->
        <div
          v-if="
            !status.iswoloadmin ||
            (status.iswoloadmin && currentPath != '/' && currentSharedFolderIsUploadAble)
          "
          class="create-folder"
        >
          <v-dialog v-model="dialog_mkdir" width="600px">
            <template v-slot:activator="{ on, attrs }">
              <v-btn class="create-folder-button" ref="mkdir_btn" v-bind="attrs" v-on="on">
                <v-icon> mdi-folder-plus </v-icon>
                <!-- ml: Create new folder -->
                <p v-html="$ml.get('new_folder')"></p>
              </v-btn>
            </template>
            <v-card>
              <v-card-title>
                <!-- ml: Create new folder -->
                <span class="text-h5" v-html="$ml.get('new_folder')"></span>
              </v-card-title>
              <v-card-text>
                <v-spacer></v-spacer>
                <v-spacer></v-spacer>
                <!-- ml: What should the new folder be called? -->
                <p v-html="$ml.get('new_folder_text')"></p>
                <v-text-field
                  v-model="mkdirquery"
                  height="50"
                  background-color="#f1f3f4"
                  filled
                  maxlength="30"
                  @keyup.enter="mkdirquery !== '' ? mkdir() : () => {}"
                ></v-text-field>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn v-html="$ml.get('cancel')" @click="dialog_mkdir = false"></v-btn>
                <v-btn
                  :disabled="mkdirquery === ''"
                  style="color: #fff; margin-left: 20px"
                  v-html="$ml.get('create')"
                  color="#003F69"
                  @click="mkdir()"
                >
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </div>
        <!-- Klient verwalten -->
        <div
          v-if="status.iswoloadmin && status.wolo_member_loaded && !status.wolo_folders"
          class="manage-wolo"
        >
          <v-dialog v-model="dialog_admin_wolo" width="600px">
            <v-card>
              <v-card-title>
                <!-- ml: Client of {0} -->
                <span
                  class="text-h5"
                  v-html="$ml.get('manage_wolo_text1').replace('{0}', woloGroup)"
                >
                </span>
              </v-card-title>
              <v-card-text>
                <br />
                <MemberControl
                  :institution="woloGroup"
                  :institution_member="actual_admin_wolo"
                  :loading="status.membercontrol_loading"
                  :shown="dialog_admin_wolo"
                  @resend_welcome="
                    id => {
                      $emit('resend_welcome', id);
                    }
                  "
                  @admin_update_member="
                    (a, b, c) => {
                      $emit('admin_update_member', a, b, c);
                    }
                  "
                  @admin_delete="
                    (a, b) => {
                      $emit('admin_delete', a, b);
                    }
                  "
                ></MemberControl>
              </v-card-text>
              <v-card-actions>
                <v-divider></v-divider>
                <v-btn v-html="$ml.get('cancel')" text @click="dialog_admin_wolo = false"></v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </div>
      </div>
      <div v-if="dragged">
        <Overlay></Overlay>
      </div>
      <!-- Documents List -->
      <div class="documents-content">
        <upload-dummies
          v-if="status.uploading"
          :uploading_files="uploading_files"
          :status="status"
        ></upload-dummies>
        <!-- SEARCH-->
        <!-- MLME --  label suche  -->
        <div style="display: flex" v-if="!mobile">
          <v-text-field
            v-model="rowSearchQuery"
            prepend-icon="mdi-magnify"
            :label="$ml.get('search')"
            @input="searchFilter()"
          >
          </v-text-field>
          <v-icon
            @click="
              () => {
                rowSearchQuery = '';
                searchFilter();
              }
            "
          >
            mdi-close
          </v-icon>
        </div>
        <div style="width: 100%" v-if="status.loading || !status.files_loaded">
          <Skeletons></Skeletons>
        </div>
        <div
          v-if="
            own_woloGroups.length === 0 &&
            !status.loading &&
            status.files_loaded &&
            status.iswoloadmin
          "
          style="width: 100%"
        >
          <p v-html="$ml.get('noClientForSozi')"></p>
        </div>
        <!-- user list -->
        <div
          v-if="
            !(status.loading || !status.files_loaded) &&
            status.iswoloadmin &&
            status.wolo_member_loaded &&
            !status.wolo_folders
          "
          style="width: 100%"
        >
          <v-card
            v-for="wolo in own_woloGroups"
            class="listelement"
            :key="wolo.id"
            @click="select_admin(wolo)"
          >
            <v-badge
              v-if="wolo.fileamount > 0"
              color="#009e73"
              overlap
              class="iconinlist-user"
              :content="wolo.fileamount"
            >
              <v-icon class="iconinlist-user-icon" large> mdi-account </v-icon>
            </v-badge>
            <v-badge
              v-if="wolo.fileamount === 0"
              overlap
              class="iconinlist-user"
              :content="wolo.fileamount"
              ><v-icon class="iconinlist-user-icon" large> mdi-account </v-icon>
            </v-badge>
            <p class="wolo-text">{{ wolo.id }} &nbsp;</p>
            <v-icon
              class="menu-icon wolosettings"
              @click.stop
              @click="
                () => {
                  actual_admin_wolo = wolo;
                  dialog_admin_wolo = true;
                }
              "
            >
              mdi-cog
            </v-icon>
          </v-card>
        </div>
        <div
          v-if="
            (!(status.loading || !status.files_loaded) && !this.status.iswoloadmin) ||
            this.status.wolo_folders
          "
          style="width: 100%"
        >
          <div v-if="move_row !== undefined">
            <!-- ml: Moving file {0} -->
            <br />
            <h3 v-html="$ml.get('moving_file').replace('{0}', move_row.basename)"></h3>
            <br />
            <!-- ml: Cancel -->
            <v-btn v-html="$ml.get('cancel')" @click="move_row = undefined"></v-btn>
            &nbsp;
            <v-btn
              style="color: #fff"
              color="#006AB3"
              @click="
                $emit('move', move_row, currentPath);
                move_row = undefined;
              "
            >
              <!-- ml: Move file here -->
              <p v-html="$ml.get('file_move_here')"></p>
            </v-btn>
            <br />
            <br />
            <v-divider></v-divider>
            <br />
          </div>
          <p></p>
          <!-- wolo(client) and no files in the folder -->
          <div v-if="own_rows.length == 0 && !status.iswoloadmin">
            <p v-if="rowSearchQuery === ''" v-html="$ml.get('no_files_here_client')"></p>
            <p v-else v-html="$ml.get('no_files_here_client_search')"></p>
          </div>
          <!-- admin and no files in the folder -->
          <div v-if="own_rows.length == 0 && status.iswoloadmin">
            <p v-html="$ml.get('no_files_here_admin')"></p>
          </div>
          <!-- admin and no files overall shared-->
          <div v-if="noFilesInWolo && status.iswoloadmin && status.wolo_folders">
            <p v-html="$ml.get('no_files_got_shared')"></p>
          </div>

          <div v-for="(r, index) in own_rows" :key="r.filename" @click="select(r)">
            <v-card
              v-if="
                !status.iswoloadmin ||
                (status.iswoloadmin && status.wolo_folders && r.owner === selectedWolo)
              "
              :class="r.type === 'file' ? 'listelement' : 'listelement_drop'"
            >
              <v-badge
                v-if="status.iswoloadmin && r.type === 'directory'"
                color="#009e73"
                overlap
                class="iconinlist-user"
                :icon="r.props.permissions.includes('CK') ? 'mdi-upload' : 'mdi-upload-off'"
              >
                <v-icon v-if="r.type === 'directory'" class="iconinlist-folder">
                  mdi-folder
                </v-icon>
              </v-badge>
              <v-icon
                v-if="r.type === 'directory' && !status.iswoloadmin"
                class="iconinlist-folder"
              >
                mdi-folder
              </v-icon>
              <img v-if="r.type === 'file' && r.thumb" class="thumbnail" :id="'img:' + index" />
              <v-icon
                v-if="r.type === 'file' && !r.thumb && !status.iswoloadmin"
                class="iconinlist-file"
              >
                mdi-file-outline
              </v-icon>
              <v-icon
                v-if="r.type === 'file' && !r.thumb && status.iswoloadmin"
                class="iconinlist-file"
              >
                mdi-account
              </v-icon>
              <p class="listelement-text">
                {{ r.basename }} &nbsp;
                <b>
                  {{ r.size !== '0 Byte' && r.size !== undefined ? r.size : '' }}
                </b>
              </p>
              <p class="listelement-text-mobile">
                {{ r.basename }}
              </p>
              <!-- download -->
              <v-icon
                v-if="r.type === 'file'"
                class="menu-icon download"
                @click.stop
                @click="download(r)"
              >
                mdi-download
              </v-icon>
              <v-menu v-if="!status.iswoloadmin" offset-y>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon class="menu-icon dots" v-on="on" v-bind="attrs">
                    mdi-dots-vertical
                  </v-icon>
                </template>
                <!-- ml: Rename -->
                <p
                  v-if="!status.iswoloadmin"
                  class="dropdownelement"
                  v-html="$ml.get('renamesimple')"
                  @click="
                    () => {
                      actual_row = r;
                      dialog_rename = true;
                    }
                  "
                ></p>
                <!-- ml: move -->
                <p
                  class="dropdownelement"
                  v-html="$ml.get('movesimple')"
                  @click="
                    () => {
                      move_row = r;
                    }
                  "
                ></p>
                <!-- REMOVE -->
                <p
                  class="dropdownelement"
                  v-html="$ml.get('delete')"
                  @click="
                    () => {
                      actual_row = r;
                      dialog_remove = true;
                      $nextTick(() => $refs.delete_btn.$el.focus());
                    }
                  "
                ></p>
                <!-- ml: Download -->
                <p
                  v-if="r.type != 'directory'"
                  class="dropdownelement"
                  v-html="$ml.get('download')"
                  @click="download(r)"
                ></p>
              </v-menu>
              <v-icon
                v-if="!status.iswoloadmin && !r.shared"
                class="menu-icon privacy"
                :key="componentKey"
                @click.stop
                @click="
                  () => {
                    actual_row = r;
                    dialog_share = true;
                  }
                "
              >
                mdi-lock
              </v-icon>
              <v-icon
                v-if="!status.iswoloadmin && r.shared"
                class="menu-icon privacyshared"
                :key="componentKey"
                @click.stop
                @click="
                  () => {
                    actual_row = r;
                    dialog_share = true;
                  }
                "
              >
                mdi-lock-open-variant
              </v-icon>
            </v-card>
          </div>
        </div>
      </div>
    </div>
    <v-bottom-navigation color="indigo" grow>
      <UploaderpageMobile
        :path="currentPath"
        @error="
          (a, b, c, d, e) => {
            $emit('error', a, b, c, d, e);
          }
        "
        @upload="
          passtrough => {
            $emit('upload', passtrough);
          }
        "
      >
      </UploaderpageMobile>
      <UploaderpageMobileScan
        :path="currentPath"
        @error="
          (a, b, c, d, e) => {
            $emit('error', a, b, c, d, e);
          }
        "
        @upload="
          passtrough => {
            $emit('upload', passtrough);
          }
        "
      >
      </UploaderpageMobileScan>
      <v-btn
        :disabled="!(!status.iswoloadmin || status.wolo_folders)"
        @click="
          dialog_mkdir = true;
          $nextTick(() => $refs.mkdir_btn.$el.focus());
        "
      >
        <span v-html="$ml.get('new_folder')"></span>
        <v-icon> mdi-folder-plus </v-icon>
      </v-btn>
    </v-bottom-navigation>
    <!-- //////////////// SHARE DIALOG ///////////////// -->
    <v-dialog v-if="dialog_share" v-model="dialog_share" width="600px">
      <v-card class="share-dialog">
        <v-card-title>
          <v-icon v-if="actual_row.type === 'file'" class="iconinlist-folder"> mdi-file </v-icon>
          <v-icon v-if="actual_row.type === 'directory'" class="iconinlist-folder">
            mdi-folder
          </v-icon>
          <!-- ml: share -->
          <span
            class="text-h5"
            v-html="$ml.get('shared_docs_text').replace('{0}', actual_row.basename)"
          >
          </span>
        </v-card-title>
        <v-card-text>
          <v-divider></v-divider>
          <div v-if="actual_row.shared" class="shares-list">
            <!-- ml: Institutions and persons who currently have access -->
            <h3
              style="margin-bottom: 25px; text-align: left"
              v-html="$ml.get('share_institutions_with_access')"
            ></h3>
            <div v-for="s in actual_row.sharedVal" :key="s.id">
              <div v-if="s.share_type === 1" class="shares-list-item">
                <div class="shares-list-item-content">
                  <div class="shares-list-item-info">
                    <v-icon class="modal-icon menu-icon shares-list-item-icon-avatar" color="#fff">
                      mdi-home
                    </v-icon>
                    <p class="shares-list-item-text">
                      {{ s.share_with_displayname }}
                    </p>
                  </div>
                  <ShareTooltips
                    class="share-tooltips"
                    :share="s"
                    :componentKey="componentKey"
                    @update_share="update_share"
                    @delete_share="delete_share"
                  >
                  </ShareTooltips>
                </div>
              </div>
              <!-- Link Freigabe -->
              <div v-if="s.share_type === 3" class="shares-list-item">
                <div class="shares-list-item-content">
                  <div class="shares-list-item-info">
                    <v-icon class="modal-icon menu-icon shares-list-item-icon-link" color="#fff">
                      mdi-link
                    </v-icon>
                    <v-text-field v-model="s.url" class="shares-list-item-link" :readonly="true">
                    </v-text-field>
                    <v-tooltip class="modal-icon menu-icon" bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon
                          class="menu-icon"
                          style="width: 40px; height: 40px"
                          v-bind="attrs"
                          v-on="on"
                          @click="copyToClipBoard(s.url)"
                        >
                          mdi-content-copy
                        </v-icon>
                      </template>
                      <!-- ml: copy link -->
                      <span v-html="$ml.get('copy_link')"></span>
                    </v-tooltip>
                  </div>
                  <ShareTooltips
                    class="share-tooltips"
                    :share="s"
                    @update_share="update_share"
                    @delete_share="delete_share"
                  >
                  </ShareTooltips>
                </div>
              </div>
              <div v-if="s.share_type === 4" class="shares-list-item">
                <div class="shares-list-item-content">
                  <div class="shares-list-item-info">
                    <v-icon class="modal-icon menu-icon shares-list-item-icon-mail" color="#fff">
                      mdi-email
                    </v-icon>
                    <p class="shares-list-item-mail">
                      {{ s.share_with_displayname }}
                    </p>
                  </div>
                  <ShareTooltips
                    class="share-tooltips"
                    :share="s"
                    @update_share="update_share"
                    @delete_share="delete_share"
                  >
                  </ShareTooltips>
                </div>
              </div>
            </div>
          </div>
          <!-- //////////////// Freigabe Optionen ////////////////////// -->
          <v-divider></v-divider>
          <v-spacer style="margin-bottom: 20px"></v-spacer>
          <!-- FREIGABE AN INSTITUION ERSTELLEN Button -->
          <!-- ml: Enable access -->
          <h3
            style="margin-bottom: 25px; text-align: left; margin-left: 10%"
            v-html="$ml.get('sharing_give_access')"
          ></h3>
          <!-- ml: Share with institution or social worker -->
          <div
            v-if="!share_to_mail"
            class="share-button"
            @click="share_to_institution = !share_to_institution"
          >
            <v-icon color="#fff"> mdi-home </v-icon>
            &nbsp;
            <span v-html="$ml.get('share_long')"></span>
          </div>
          <div class="share-button-box" v-if="share_to_institution">
            <!-- ml: name of person or institution -->
            <v-autocomplete
              v-model="selectedInstitution"
              height="50"
              width="100%"
              color="#0093F5"
              chips
              hide-no-data
              background-color="#f1f3f4"
              style="width: 100%"
              item-text="label"
              :items="shareSearchResults"
              :search-input.sync="search"
              :loading="status.loading"
              :placeholder="$ml.get('share_search_placeholder')"
            >
            </v-autocomplete>
            <!-- ml: Is allowed to upload and edit documents -->
            <v-checkbox
              v-model="permissions.edit"
              inset
              color="#009e73"
              :label="
                actual_row.type === 'directory'
                  ? $ml.get('sharing_folder_permissions')
                  : $ml.get('sharing_file_permissions')
              "
            >
            </v-checkbox>
            <v-divider style="margin-bottom: 10px"></v-divider>
            <v-btn
              class="modal-icon menu-icon share-modal-button"
              v-html="$ml.get('cancel')"
              color="#fff"
              @click="share_to_institution = !share_to_institution"
            >
            </v-btn>
            &nbsp;&nbsp;
            <!-- @ ROBIN -- HIER FREIGABE PERMISSION MIT EINBAUEN -->
            <v-btn
              class="modal-icon menu-icon share-modal-button"
              style="color: #fff"
              color="#006AB3"
              @click="
                () => {
                  startshare(actual_row);
                  share_to_institution = false;
                }
              "
            >
              <p v-html="$ml.get('share')"></p>
              <v-icon> mdi-share </v-icon>
            </v-btn>
          </div>
          <!-- FREIGABE E-MAIL ERSTELLEN Button -->
          <div
            v-if="!share_to_institution"
            class="share-button"
            @click="share_to_mail = !share_to_mail"
          >
            <!-- ml: create sharing email -->
            <v-icon color="#fff"> mdi-email-outline </v-icon>
            &nbsp;
            <span v-html="$ml.get('sharing_create_email')"></span>
          </div>
          <div v-if="share_to_mail" class="share-button-box">
            <!-- ml: E-mail address -->
            <v-text-field
              v-model="emailshare"
              background-color="#f1f3f4"
              height="50"
              :placeholder="$ml.get('email_placeholder')"
              :rules="emailrule"
            >
            </v-text-field>
            <v-divider style="margin-bottom: 10px"></v-divider>
            <v-btn
              class="modal-icon menu-icon share-modal-button"
              color="#fff"
              @click="share_to_mail = !share_to_mail"
            >
              <p v-html="$ml.get('cancel')"></p>
            </v-btn>
            &nbsp;&nbsp;
            <v-btn
              class="modal-icon menu-icon share-modal-button"
              style="color: #fff"
              color="#006AB3"
              @click="
                () => {
                  permissions.link = false;
                  permissions.email = true;
                  startshare(actual_row);
                  share_to_mail = false;
                }
              "
            >
              <p v-html="$ml.get('share')"></p>
              <v-icon> mdi-share </v-icon>
            </v-btn>
          </div>
          <!-- FREIGABE LINK ERSTELLEN Button -->
          <div
            v-if="!share_to_institution && !share_to_mail && linkshare_count < 6"
            class="share-button share-button-link"
            @click="
              () => {
                permissions.link = true;
                permissions.email = false;
                startshare(actual_row);
              }
            "
          >
            <!-- ml: create sharing link -->
            <v-icon color="#fff"> mdi-link </v-icon>
            &nbsp;
            <span v-html="$ml.get('sharing_create_link')"></span>
          </div>
          <v-spacer style="margin-bottom: 20px"></v-spacer>
          <v-divider></v-divider>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            v-html="$ml.get('close')"
            text
            @click="
              () => {
                dialog_share = false;
                share_to_institution = false;
                share_to_mail = false;
              }
            "
          >
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-if="dialog_remove" width="600px" v-model="dialog_remove">
      <v-card>
        <v-card-title>
          <!-- ml: Do you really want to delete <b>{0}</b>? -->
          <span
            class="text-h5"
            v-html="$ml.get('delete_check').replace('{0}', actual_row.basename)"
          >
          </span>
        </v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            v-html="$ml.get('delete')"
            ref="delete_btn"
            color="#F00"
            style="color: red; margin-left: 20px"
            text
            @click="remove(actual_row)"
            @keyup.enter="remove(actual_row)"
          >
          </v-btn>
          <v-btn text @click="dialog_remove = false" v-html="$ml.get('cancel')"></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-if="dialog_rename" width="600px" v-model="dialog_rename">
      <v-card>
        <v-card-title>
          <!-- ml: rename {0} -->
          <span class="text-h5" v-html="$ml.get('rename').replace('{0}', actual_row.basename)">
          </span>
        </v-card-title>
        <v-spacer></v-spacer>
        <v-card-text>
          <!-- ml: What do you want the new name to be? -->
          <p v-html="$ml.get('rename_text')"></p>
          <v-text-field
            v-model="renamequery"
            height="50"
            background-color="#f1f3f4"
            @keyup.enter="rename(actual_row)"
          >
          </v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn v-html="$ml.get('cancel')" @click="dialog_rename = false"></v-btn>
          <v-btn
            v-html="$ml.get('save')"
            color="#003F69"
            style="color: #fff; margin-left: 20px"
            @click="rename(actual_row)"
          >
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialog_preview" width="600px">
      <v-card>
        <v-card-title>
          <!-- ml: Preview -->
          <span class="text-h5" v-html="$ml.get('preview')"></span>
        </v-card-title>
        <v-card-text v-if="this.previewfile !== undefined">
          <v-spacer></v-spacer>
          <v-spacer></v-spacer>
          <h4>
            {{ this.previewfile.basename }}
          </h4>
          <!-- HERE ROBIN --->
          <v-spacer></v-spacer>
          <div
            v-if="this.previewfile.mime === 'image/jpeg' || this.previewfile.mime === 'image/png'"
          >
            <img
              v-if="this.previewfile.type === 'file' && this.previewfile.thumb"
              class="preview"
              :id="'preview'"
              @load="previewloaded = true"
            />
            <div v-if="!previewloaded">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </div>
          </div>
          <div v-else>
            <!-- ml: No preview available -->
            <h2 v-html="$ml.get('no_preview_available')"></h2>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="green darken-1"
            text
            @click="
              () => {
                (dialog_preview = false), (previewfile = undefined);
              }
            "
          >
            <p v-html="$ml.get('close')"></p>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import Uploaderpage from './Uploaderpage.vue';
import UploaderpageMobile from './UploaderpageMobile.vue';
import UploaderpageMobileScan from './UploaderpageMobileScan.vue';
import MemberControl from './MemberControl.vue';
import CreateMember from './CreateMember.vue';
import ShareTooltips from './ShareTooltips.vue';
import Skeletons from './Skeletons.vue';
import UploadDummies from './UploadDummies.vue';
import PasswordReset from './PasswordReset.vue';
import Overlay from './Overlay.vue';

export default {
  name: 'FileViewer',

  components: {
    Uploaderpage,
    UploaderpageMobile,
    UploaderpageMobileScan,
    Skeletons,
    UploadDummies,
    PasswordReset,
    ShareTooltips,
    MemberControl,
    CreateMember,
    Overlay
  },

  props: {
    mobile: Boolean,
    authString: String,
    selectedWolo: String,
    rows: Array,
    status: Object,
    currentPath: String,
    currentSharedFolderIsUploadAble: Boolean,
    pathStack: Array,
    shareSearchResults: Array,
    componentKey: Number,
    institution: String,
    woloGroup: String,
    woloGroups: Array,
    forceadmininteraction: Boolean,
    dragged: Boolean,
    dragged_items: Array,
    group: String,
    countDownCounter: Number
  },

  data() {
    return {
      date: new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .substr(0, 10),
      menu: false,
      noFilesInWolo: false,
      show_current_pw: false,
      show_new_pw: false,
      show_repeat_pw: false,
      pwresetquery_current: '',
      pwresetquery_new: '',
      pwresetquery_repeat: '',
      // rules for password creation
      rules: {
        // The field must not be empty
        empty: v => !!v || this.$ml.get('pw_rules_empty'),
        // Password must have at least 10 characters
        min: v => (v && v.length >= 10) || this.$ml.get('pw_rules_min'),
        // The passwords must match
        match: v => this.pwresetquery_new === v || this.$ml.get('pw_rules_match'),
        dirmaxlength: v => (v && v.length <= 30) || this.$ml.get('dir_rules_maxlength')
      },
      pw_change_form_valid: true,
      own_woloGroups: undefined,
      own_rows: undefined,
      rowSearchQuery: '',
      permissions: {
        edit: false,
        password: false,
        link: false,
        email: false,
        exdate: false
      },
      emailrule: [
        v => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || this.$ml.get('email_rule')
      ],
      bottom_navigation_active: false,
      bottom_navigation_value: '',
      previewloaded: false,
      previewfile: undefined,
      dialog_admin_sozi: false,
      dialog_admin_wolo: false,
      dialog_admin_wolo_add: false,
      actual_admin_wolo: undefined,
      emit: false,
      move_row: undefined,
      dialog_mkdir: false,
      dialog_rename: false,
      dialog_remove: false,
      actual_row: undefined,
      dialog_preview: false,
      dialog_share: false,
      renamequery: '',
      searchquery: '',
      mkdirquery: '',
      emailshare: '',
      sharequery: '',
      passwordstring: '',
      timeout: undefined,
      tragging: undefined,
      selectedInstitution: null,
      search: null,
      share_to_institution: false,
      share_to_mail: false,
      //Bitte Funktionalität hinzufügen @ROBIN, zählen wie viele Links diese eine Freigabe schon hat
      linkshare_count: '5',
      uploading_files: []
    };
  },

  mounted() {
    // when mounted set 'own_rows' to 'rows' and 'own_woloGroups' to 'woloGroups'
    this.own_rows = this.rows;
    this.own_woloGroups = this.woloGroups;
    // prevents the "go-back"-button in the browser
    history.pushState(null, null, location.href);
    // @TODO own "go-back"-button function, close dialog or go parent
    window.onpopstate = () => {
      history.go(1);
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.emit = true;
        if (this.dialog_mkdir) {
          this.dialog_mkdir = false;
          this.emit = false;
        }
        if (this.dialog_admin_sozi) {
          this.dialog_admin_sozi = false;
          this.emit = false;
        }
        if (this.dialog_admin_wolo) {
          this.dialog_admin_wolo = false;
          this.emit = false;
        }
        if (this.dialog_admin_wolo_add) {
          this.dialog_admin_wolo_add = false;
          this.emit = false;
        }
        if (this.dialog_rename) {
          this.dialog_rename = false;
          this.emit = false;
        }
        if (this.dialog_remove) {
          this.dialog_remove = false;
          this.emit = false;
        }
        if (this.dialog_preview) {
          this.dialog_preview = false;
          this.emit = false;
        }
        if (this.dialog_share) {
          this.dialog_share = false;
          this.emit = false;
        }
        if (this.emit === true) {
          this.$emit('parent');
        }
      }, 50);
    };
  },

  watch: {
    // changes the prop into a data
    woloGroups() {
      this.own_woloGroups = this.woloGroups;
    },
    rows() {
      this.own_rows = this.rows;
      // to activate thumbnail for all pictures
      this.getImages();
    },
    selectedWolo(v) {
      this.noFilesInWolo = false;
      if (this.status.iswoloadmin && v != '') {
        this.own_woloGroups.forEach(wolo => {
          if (wolo.fileamount === 0 && wolo.id === v) {
            this.noFilesInWolo = true;
          }
        });
      }
    },
    dragged_items(v) {
      // if the user is logged in and something gets dragged into the window emit a 'upload'-Event
      if (this.status.logged_in) {
        this.status.uploading = true;
        this.uploading_files = v;
        this.$emit('upload', v);
      }
    },
    dialog_preview(val) {
      console.log('dialog preview');
      // if val is false set preview to false
      if (!val) {
        this.previewfile = undefined;
        // else get preview
      } else {
        this.getImage(this.previewfile.thumblinkbig, 'preview');
      }
    },
    // if user searches, emit 'search'-Event with the value
    search(val) {
      this.search = val;
      this.$emit('sharesearch', val);
      this.menu = false;
    }
  },

  methods: {
    /**
     * The search-function as a admin; Returns either clients fitting to the query or folders/files
     */
    searchFilter() {
      if (this.status.iswoloadmin && this.currentPath === '/' && this.selectedWolo === '') {
        // @TODO 'wgs' to proper var name?
        this.own_woloGroups = this.woloGroups.filter(wgs => {
          return wgs.id.toLowerCase().includes(this.rowSearchQuery.toLowerCase());
        });
      } else {
        // @TODO r to proper var name?
        this.own_rows = this.rows.filter(r => {
          return r.basename.toLowerCase().includes(this.rowSearchQuery.toLowerCase());
        });
      }
    },
    /**
     * @TODO there are two truncate functions in the project - externalize them into a util
     * Truncates a string if it is longer than 'n'
     *
     * @param {String} str string which should be truncated
     * @param {Number} n maximum length the string should be
     */
    truncate(str, n) {
      return str.length > n ? str.slice(0, n - 1) + '...' : str;
    },
    /**
     * Calls for each image on the page "async getImage(link, id)" to create a thumbnail
     */
    getImages() {
      let index = 0;
      // @TODO r to proper var name?
      // get for each row the thumbnail
      this.rows.forEach(r => {
        this.getImage(r.thumblink, 'img:' + index);
        index += 1;
      });
    },
    /**
     * Combines each image on the page with its Nextcloud-link to create a thumbnail
     *
     * @param {String} link Nextcloud-Link to the file
     * @param {String} id ID of the file
     */
    async getImage(link, id) {
      if (link === undefined) {
        return;
      }
      // get the result of the fetch
      let result = await fetch(link + '?format=json', {
        headers: { Authorization: this.authString }
      });
      // filter the important informations from the request
      // @TODO better var name for 'foo'
      let blob = await result.blob();
      let foo = URL.createObjectURL(blob);
      let img = document.getElementById(id);
      img.src = foo;
    },
    /**
     * Resets the searchquery and call 'searchFilter()', afterwards emits a 'select_admin'-Event with the wolo to select
     *
     * @param {Object} wolo The Object with all informations about the wolo
     */
    select_admin(wolo) {
      this.searchquery = '';
      this.searchFilter();
      this.$emit('select_admin', wolo);
    },
    /**
     * @TODO rename
     * If the selected object has the type 'file', start the preview and emit a 'select'-Event
     *
     * @param {Object} file The file which should be selected
     */
    select(file) {
      this.rowSearchQuery = '';
      this.searchFilter();
      this.previewfile = undefined;
      this.previewloaded = false;
      // if file is a file show preview
      if (file.type === 'file') {
        this.previewfile = file;
        this.dialog_preview = true;
      }
      this.$emit('select', file);
    },
    /**
     * Emits 'success'-Event with the necessary message and if it should be a toast
     *
     * @param {String} message The feedback-message of the action
     * @param {Boolean} toast If true post a toast
     */
    success(message, toast) {
      this.$emit('success', message, toast);
    },
    /**
     * Copies a text to the ClipBoard
     *
     * @param {String} textToCopy The text which should be copied
     */
    copyToClipBoard(textToCopy) {
      // https://stackoverflow.com/questions/67882865/copy-datatext-to-clipboard-in-vuenuxt-js
      navigator.clipboard.writeText(textToCopy);
      // Link copied!
      this.success(this.$ml.get('notify_copy_link'), true);
    },
    /**
     * Resets all the Queries
     */
    resetQueries() {
      this.searchquery = '';
      this.mkdirquery = '';
      this.renamequery = '';
    },
    /**
     * @TODO better var name instead of 'r'?
     * Emit a 'rename'-Event directly for directories and if its a file save the ending (.png, .jpeg) first
     *
     * @param {Object} r The Object which should be renamed
     */
    rename(r) {
      if (this.renamequery !== '') {
        // if its a directory the emit can directly be made
        if (r.type === 'directory') {
          this.$emit('rename', r, this.renamequery);
          this.dialog_rename = false;
          this.resetQueries();
          // if its not a directory the proper endings of the file have to be saved
        } else {
          var bn_length = r.basename.length;
          // get rid of the last 3 letters
          var bn_shortened3 = bn_length - 3;
          // get rid of the last 4 letters
          var bn_shortened4 = bn_length - 4;
          var bn_datatype = r.basename.substr(bn_shortened3, bn_length);
          // check if it has 3 or 4 letters after the point
          if (r.basename.substr(bn_shortened3 - 1, bn_length - (bn_shortened3 + 2)) === '.') {
            var bn_shorten_length = bn_shortened3;
          } else if (
            r.basename.substr(bn_shortened4 - 1, bn_length - (bn_shortened4 + 3)) === '.'
          ) {
            var bn_shorten_length = bn_shortened4;
          }
          // only get the datatype of the basename
          var bn_datatype = r.basename.substr(bn_shorten_length, bn_length);
          var rq_length = this.renamequery.length;
          var rq_shortened = rq_length - 3;
          // only get the datatype of the renamequery
          var rq_datatype = this.renamequery.substr(rq_shortened, rq_length);
          // check if the datatypes are the same, if not add the basename datatype to the renamequery
          if (bn_datatype === rq_datatype) {
            this.$emit('rename', r, this.renamequery);
            this.dialog_rename = false;
            this.resetQueries();
          } else {
            this.renamequery = this.renamequery + '.' + bn_datatype;
            this.$emit('rename', r, this.renamequery);
            this.dialog_rename = false;
            this.resetQueries();
          }
        }
      } else {
        this.dialog_rename = false;
      }
    },
    /**
     * @TODO better var name instead of 'r'?
     * Emits a 'deleteFile'-Event and resets the Queries
     *
     * @param {Object} r The Object which should be deleted
     */
    remove(r) {
      this.$emit('remove', r);
      this.dialog_remove = false;
      this.resetQueries();
    },
    /**
     * @TODO better var name instead of 'r'?
     * Emits a 'download'-Event and resets the Queries
     *
     * @param {Object} r The Object which should be downloaded
     */
    download(r) {
      this.$emit('download', r);
      this.resetQueries();
    },
    /**
     * Emits a 'mkdir'-Event and resets the dialog and the query of mkdir
     */
    mkdir() {
      this.$emit('mkdir', this.mkdirquery);
      this.dialog_mkdir = false;
      this.mkdirquery = '';
    },
    /**
     * Emits a 'changePassword'-Event with the old and new password
     *
     * @param {String} pwresetquery_current
     * @param {String} pwresetquery_new
     */
    change_pw(pwresetquery_current, pwresetquery_new) {
      this.$emit('change_pw', pwresetquery_current, pwresetquery_new);
    },
    /**
     * Emits a 'updateShare'-Event with the attribute to change and its new value
     *
     * @param {String} share_id The ID of the object which should be shared
     * @param {String} key The attribute which should be changed
     * @param {String} value The new value for the attribute
     */
    update_share(share_id, key, value) {
      // CHAIN EMIT
      this.$emit('update_share', share_id, key, value);
    },
    /**
     * Emits a 'deleteShare'-Event with the share to delete
     *
     * @param {Object} share The share which should be deleted
     */
    delete_share(share) {
      // CHAIN EMIT
      this.$emit('delete_share', share);
    },
    /**
     *  Emits a 'logout'-Event
     */
    logout() {
      this.$emit('logout');
    },
    /**
     * Emits a 'share'-Event and with the needed information and resets everything afterwards
     *
     * @param {Object} file File which should be shared
     */
    startshare(file) {
      // copy of permission
      let per = Object.assign({}, this.permissions);
      // share with 'LINK.PLACEHOLDER' and 'this.passwordstring'
      if (this.permissions.link) {
        this.$emit('share', file, per, 'LINK.PLACEHOLDER', this.date, this.passwordstring);
        // share with 'this.emailshare' and 'this.passwordstring'
      } else if (this.permissions.email) {
        this.$emit(
          'share',
          file,
          per,
          { shareWith: this.emailshare },
          this.date,
          this.passwordstring
        );
        // share with 'this.selectedInstitution' and 'this.permissions'
      } else if (
        !this.permissions.link &&
        !this.permissions.email &&
        this.selectedInstitution !== undefined
      ) {
        this.$emit('share', file, per, this.selectedInstitution, this.date, this.permissions);
      }
      this.emailshare = '';
      this.permissions.email = false;
      this.permissions.link = false;
      this.permissions.edit = false;
    },
    /**
     * Chain emit for 'checkLanguageSettings'
     */
    checkLanguageSettings() {
      this.$emit('checkLanguageSettings');
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.global {
  height: auto;
  width: 100vw;
  font-family: Roboto;
  overflow: hidden;
}

.header-bar {
  background: #fff;
  width: 100vw;
  height: 70px;
  position: fixed;
  top: 0px;
  left: 0px;
  margin-bottom: 150px;
  z-index: 1;
  -webkit-box-shadow: 0px 0px 44px -20px rgba(0, 0, 0, 0.3);
  box-shadow: 0px 0px 44px -20px rgba(0, 0, 0, 0.3);
}

#header-key {
  height: 30px;
  position: absolute;
  top: 21px;
  left: 2.5%;
  display: inline;
  -webkit-user-drag: none;
  -khtml-user-drag: none;
  -moz-user-drag: none;
  -o-user-drag: none;
  user-drag: none;
}

#header-key-mobile {
  display: none;
}

.logout {
  position: absolute;
  top: 15px;
  right: 30px;
}

.pw-reset {
  position: absolute;
  top: 15px;
  right: 200px;
}

.dropdownelement {
  padding: 10px;
  background-color: #006ab3;
  color: #fff;
  border-bottom: 1px #aaa solid;
}

.dropdownelement:hover {
  background-color: rgb(122, 159, 228);
}

.documents {
  width: 100vw;
  height: calc(100vh - 110px);
  margin: 0;
  margin-top: 70px;
}

.documents-header {
  background: rgba(255, 255, 255, 0.8);
  width: 100%;
  height: 70px;
  padding-top: 12px;
  padding-bottom: 8px;
  padding-left: 2.5%;
  padding-right: 2.5%;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
}

.documents-content {
  background: rgba(255, 255, 255, 0.8);
  padding: 2% 3% 2.5% 2%;
  width: 100vw;
  flex-grow: 1;
  overflow-y: auto;
  height: calc(100vh - 180px);
  scrollbar-width: thin;
}

.folders {
  float: left;
  cursor: pointer;
  height: 50px;
  overflow: visible;
  max-width: 50%;
}

.mobile-folders {
  display: none;
}

.manage-sozi {
  margin-left: 20px;
}

.manage-wolo {
  margin-left: 20px;
}

.manage-sozi-folder {
  margin-left: 20px;
}

.manage-sozi-button {
  padding: 15px 30px 15px 30px;
  float: right;
  height: 70px;
  font-weight: 500;
  background: rgb(250, 120, 120);
}

.manage-sozi-button:hover {
  padding: 15px 30px 15px 30px;
  float: right;
  height: 70px;
  font-weight: 500;
  background: rgb(247, 7, 7);
}

.manage-wolo-folder {
  margin-left: 20px;
}

.manage-wolo-button {
  padding: 15px 30px 15px 30px;
  float: right;
  height: 70px;
  font-weight: 500;
  background: rgb(78, 94, 233);
}

.manage-wolo-button:hover {
  padding: 15px 30px 15px 30px;
  float: right;
  height: 70px;
  font-weight: 500;
  background: rgb(62, 34, 184);
}

.create-folder {
  margin-left: 20px;
  float: right;
  padding-top: 5px;
  margin-right: 20px;
}
.folder {
  float: left;
  height: auto;
  font-weight: 500;
  padding: 10px 10px 10px 10px;
  vertical-align: baseline;
  margin-left: -10px;
}

.folder.v-icon {
  vertical-align: -20%;
}

.folder:hover {
  background-color: rgba(0, 106, 179, 0.1);
  border-radius: 50px;
}

.folder.back {
  padding: 10px;
  float: left;
  margin-left: 0px;
}

.empty-folder {
  width: 80%;
  margin: 10%;
}

.iconinlist-folder {
  margin-right: 20px;
  background: #003f69;
  height: 60px;
  width: 60px;
  float: left;
  color: #fff !important;
  border-radius: 4px;
}

.iconinlist-file {
  margin-right: 20px;
  background: #006ab3;
  height: 60px;
  width: 60px;
  float: left;
  color: #fff !important;
}

.iconinlist-user {
  margin-right: 20px;
  background: #003f69;
  height: 60px;
  width: 60px;
  float: left;
  color: #fff !important;
  border-radius: 4px;
}

.iconinlist-user-icon {
  color: #fff !important;
  height: 60px;
  width: 60px;
}

.listelement {
  height: 60px;
  width: calc(100% - 25px);
  background-color: rgba(255, 255, 255, 0.5) !important;
  margin: 12px;
}

.listelement p {
  padding-top: 15px;
  width: 100%;
  text-align: left;
}

.listelement_drop p {
  padding-top: 15px;
  width: 100%;
  text-align: left;
}

.listelement_drop {
  height: 60px;
  width: calc(100% - 25px);
  background-color: rgba(255, 255, 255, 0.5) !important;
  margin: 12px;
}

.listelement:hover {
  background-color: rgba(253, 246, 227, 0.2) !important;
}

.listelement_drop:hover {
  background-color: rgba(253, 246, 227, 0.2) !important;
}

.wolo-text {
  width: 80% !important;
  overflow: hidden;
  line-height: 1.9;
  height: 45px;
  font-size: 18px;
  display: flex;
  text-align: left;
}

.wolo-text-mobile {
  width: 60% !important;
  overflow: hidden;
  line-height: 1.9;
  height: 45px;
  font-size: 12px;
  display: flex;
  text-align: left;
}

.listelement-text {
  width: 80% !important;
  overflow: hidden;
  line-height: 1.9;
  height: 45px;
  font-size: 18px;
  display: flex;
  text-align: left;
}

.listelement-text-mobile {
  display: none;
}

.menu-icon {
  color: #333;
}

.menu-icon.privacy {
  background: #009e73;
  color: #fff !important;
  width: 62px;
  height: 62px;
  border-radius: 100px 100px 100px 100px !important;
  position: absolute;
  top: -1px;
  right: -26px;
}

.menu-icon.privacy.small-icon {
  width: 40px;
  height: 40px;
  margin-right: 15px;
}

.menu-icon.privacyshared.small-icon {
  width: 50px;
  height: 50px;
  margin-right: 15px;
}

.modal-icon {
  position: inherit !important;
}

.share-modal-button {
  padding: 0 16px;
  font-size: 0.975rem !important;
}

.share-tooltips {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  overflow: visible;
}

.shares-list {
  width: 100%;
  height: auto;
  margin-bottom: 30px;
  margin-top: 30px;
}

.v-text-field input {
  padding: 8px 16px !important;
}

.shares-list-item {
  height: 50px;
  width: 100%;
  margin-bottom: 15px;
  vertical-align: middle;
  text-align: left;
  font-family: Roboto;
  font-weight: 500;
  font-size: 16px;
  padding: 5px;
  background: #f1f3f4;
  border-radius: 25px 25px 25px 25px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.shares-list-item:hover {
  background: #d3d3d3;
  cursor: default;
}

.shares-list-item-content {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
}

.shares-list-item-info {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  max-width: 60%;
}

.shares-list-item-icon-link {
  height: 40px;
  width: 40px;
  background: #003f69;
  border-radius: 25px;
  color: #fff;
  margin-right: 10px;
}

.shares-list-item-icon-mail {
  height: 40px;
  width: 40px;
  background: #003f69;
  border-radius: 25px;
  color: #fff;
  margin-right: 10px;
}

.shares-list-item-icon-avatar {
  height: 40px;
  width: 40px;
  background: #003f69;
  border-radius: 25px;
  color: #fff;
  margin-right: 10px;
}

.shares-list-item-text {
  vertical-align: middle !important;
  padding-top: 10px;
  overflow: hidden;
}

.shares-list-item-mail {
  vertical-align: middle !important;
  padding-top: 10px;
  overflow: hidden;
  height: 30px;
  width: 60%;
}

.shares-list-item-link {
  padding: 0;
}

.shares-list-item-icon-permission {
  margin-right: 5px;
}

.shares-list-item-icon-remove {
  text-align: right;
}

.shares-list-item-icon-edit {
  text-align: right;
}

.shares-list-item-icon-remove-icon {
  height: 30px;
  width: 30px;
  padding: 10px 10px 0px 0px !important;
  margin-left: 30px;
}

.shares-list-item-icon-edit-icon {
  height: 30px;
  width: 30px;
  padding: 10px 10px 0px 0px !important;
  margin-left: 30px;
}

.share-button {
  margin-top: 15px;
  margin-bottom: 15px;
  cursor: pointer;
  height: auto;
  width: 80%;
  margin-left: 10%;
  color: #fff;
  background: #006ab3;
  border-radius: 4px;
  padding: 20px;
  font-size: 16px;
}

.share-button-box {
  height: auto;
  width: 80%;
  background: #c7e8ff;
  padding: 20px;
  margin-top: -15px;
  margin-left: 10%;
}

.share-button-link:hover {
  background: #003f69;
}
.share-button-link:active {
  background: #002944;
  border: #000 1px solid;
}

.menu-icon.privacyshared {
  background: #f0e442;
  width: 62px;
  height: 62px;
  border-radius: 100px 100px 100px 100px !important;
  position: absolute;
  top: -1px;
  right: -26px;
}

.menu-icon.wolosettings {
  background: #006ab3;
  width: 62px;
  height: 62px;
  border-radius: 100px 100px 100px 100px !important;
  position: absolute;
  top: -1px;
  right: -26px;
  color: #fff;
}

.menu-icon.download {
  position: absolute;
  right: 95px;
  top: 18px;
}

.menu-icon.dots {
  position: absolute;
  right: 55px;
  top: 18px;
}

.thumbnail {
  margin-right: 20px;
  background: #006ab3;
  height: 60px;
  width: 60px;
  float: left;
  color: #fff !important;
  border: solid 3px #006ab3;
}
.preview {
  width: 100%;
  height: 100%;
  margin-right: 20px;
  background: #006ab3;

  float: left;
  color: #fff !important;
  border: solid 3px #006ab3;
}

.share-dialog {
  overflow: hidden;
  scrollbar-width: thin;
}

.share-dialog-accesslist {
  background: #aaa;
}

.share-dialog-permissions {
  display: grid;
  grid-template-rows: 1fr 1fr;
  grid-template-columns: 1fr 1fr 1fr;
}

.logout-desktop {
  display: inline;
}

.logout-mobile {
  display: none;
}

.pw-reset-desktop {
  display: inline;
}

.pw-reset-mobile {
  display: none;
}

.mx-auto {
  width: 100%;
  margin: 10px;
}

.mx-auto:nth-of-type(2) {
  opacity: 0.8;
}
.mx-auto:nth-of-type(3) {
  opacity: 0.6;
}
.mx-auto:nth-of-type(4) {
  opacity: 0.4;
}
.mx-auto:nth-of-type(5) {
  opacity: 0.2;
}

::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: #afafaf;
  border-radius: 20px;
}

::-webkit-scrollbar-thumb {
  background: #006ab3;
  border-radius: 20px;
}

::-webkit-scrollbar-thumb:hover {
  background: #00558d;
}

.logout_counter_desktop {
  margin-top: 15px;
  margin-bottom: 15px;
  max-height: 40px;
  width: 150px;
  margin-left: calc(50% - 75px);
  color: #fff;
  background: #003f69;
  border-radius: 4px;
  font-size: 15px;
  overflow: hidden;
}

@media only screen and (max-width: 700px) {
  .header-bar {
    -webkit-box-shadow: 0px 0px 10px -3px #000000;
    box-shadow: 0px 0px 10px -3px #000000;
  }

  #header-key {
    display: none;
  }

  #header-key-mobile {
    height: 50px;
    position: absolute;
    top: 10px;
    left: 5%;
    display: inline;
  }

  .logout {
    right: 2.5%;
  }

  .logout-desktop {
    display: none;
  }

  .logout-mobile {
    display: inline;
    margin-top: -10px;
  }

  .pw-reset-desktop {
    display: none;
  }

  .pw-reset-mobile {
    display: inline;
    margin-right: -100px;
  }

  .documents-header {
    display: none;
  }

  .mobile-folders {
    display: flex;
    font-size: 18px;
    padding: 24px;
    width: 80%;
    height: 70px;
    overflow: hidden;
    position: fixed;
    top: 0px;
    left: 0px;
    z-index: 4;
  }

  .mobile-folders-back {
    margin-right: 20px;
  }

  .mobile-folders-text {
    height: 25px;
    overflow: hidden;
  }

  .dropdownelement {
    padding: 20px 10px 20px 10px;
    background-color: #006ab3;
    color: #fff;
    border-bottom: 1px #aaa solid;
  }

  .footer {
    display: none;
  }

  .listelement p {
    padding-top: 10px;
  }

  .listelement_drop p {
    padding-top: 10px;
  }

  .listelement-text {
    display: none;
  }

  .listelement-text-mobile {
    width: 45% !important;
    overflow: hidden;
    line-height: 2.5;
    height: 40px;
    font-size: 16px;
    display: flex;
    text-align: left;
  }

  .menu-icon.download {
    display: none;
  }

  .menu-icon.dots {
    position: absolute;
    right: 50px;
    top: 18px;
  }

  .documents {
    height: calc(100vh - 127px);
    margin-top: 70px;
  }

  .documents-content {
    overflow-x: hidden;
    height: calc(100vh - 55px);
    padding-bottom: 180px;
    margin-top: 0px;
    padding-top: 70px;
  }

  .listelement {
    width: calc(100% - 40px) !important;
  }

  .listelement_drop {
    width: calc(100% - 40px);
  }

  .shares-list-item-permissions {
    display: none;
  }

  .share-button {
    margin-top: 15px;
    margin-bottom: 15px;
    height: auto;
    width: 100%;
    margin-left: 0;
    padding: 20px;
    font-size: 16px;
  }

  .share-button-box {
    height: auto;
    width: 100%;
    background: #c7e8ff;
    padding: 20px;
    margin-top: -15px;
    margin-left: 0;
  }

  .share-button-link:hover {
    background: #003f69;
  }
  .share-button-link:active {
    background: #002944;
    border: #000 1px solid;
  }

  .shares-list-item-icon-link {
    width: 100px;
  }

  .shares-list-item-icon-mail {
    width: 45px;
  }

  .shares-list-item-icon-avatar {
    width: 40px;
  }

  .share-modal-button {
    padding: 5px 5px !important;
    font-size: 0.7rem !important;
  }

  .shares-list-item-text {
    font-size: 14px !important;
  }

  .share-tooltips {
    transform: scale(0.8);
  }
  .logout_counter_desktop {
    margin-top: 10px;
    margin-bottom: 15px;
    max-height: 60px;
    max-width: 90px;
    margin-left: calc(50% - 60px);
    color: #fff;
    background: #003f69;
    border-radius: 4px;
    font-size: 14px;
    overflow: hidden;
  }
}
</style>
