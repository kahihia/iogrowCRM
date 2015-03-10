app.controller('AccountListCtrl', ['$scope', '$filter', 'Auth', 'Account', 'Tag', 'Edge','Attachement', 'Email',
    function($scope, $filter, Auth, Account, Tag, Edge,Attachement, Email) {
        $("ul.page-sidebar-menu li").removeClass("active");
        $("#id_Accounts").addClass("active");
        document.title = "Accounts: Home";
        $scope.selectedOption = 'all';
        $scope.isSignedIn = false;
        $scope.immediateFailed = false;
        $scope.nextPageToken = undefined;
        $scope.prevPageToken = undefined;
        $scope.isLoading = false;
        $scope.nbLoads=0;
        $scope.Loadingtest=false;
        $scope.isMoreItemLoading = false;
        $scope.pagination = {};
        $scope.currentPage = 01;
        $scope.pages = [];
        $scope.accounts = [];
        $scope.account = {};
        $scope.selected_tags = [];
        $scope.account.access = 'public';
        $scope.order = '-updated_at';
        $scope.account.account_type = 'Customer';
        $scope.draggedTag = null;
        $scope.tag = {};
        $scope.testtitle = "Customer Support Customer Support";
        $scope.showNewTag = false;
        $scope.showUntag = false;
        $scope.edgekeytoDelete = undefined;
        $scope.show="cards";
        $scope.email={};
        $scope.selectedCards=[];
        $scope.allCardsSelected=false;
        $scope.color_pallet = [
            {'name': 'red', 'color': '#F7846A'},
            {'name': 'orange', 'color': '#FFBB22'},
            {'name': 'yellow', 'color': '#EEEE22'},
            {'name': 'green', 'color': '#BBE535'},
            {'name': 'blue', 'color': '#66CCDD'},
            {'name': 'gray', 'color': '#B5C5C5'},
            {'name': 'teal', 'color': '#77DDBB'},
            {'name': 'purple', 'color': '#E874D6'},
        ];
        $scope.tag.color = {'name': 'green', 'color': '#BBE535'};
        $scope.selectedAccount=null;
        $scope.currentAccount=null;
        $scope.accountToMail=null;
        $scope.showTagsFilter=false;
        $scope.showNewTag=false;
        $scope.emailSentMessage=false;
        $scope.smallModal=false;
        $scope.inProcess=function(varBool,message){
          if (varBool) {   
            if (message) {
              console.log("starts of :"+message);
             
            };
            $scope.nbLoads=$scope.nbLoads+1;
            if ($scope.nbLoads==1) {
              $scope.isLoading=true;
            };
          }else{
            if (message) {
              console.log("ends of :"+message);
            };
            $scope.nbLoads=$scope.nbLoads-1;
            if ($scope.nbLoads==0) {
               $scope.isLoading=false;
            };
          };
        }       
        $scope.fromNow = function(fromDate){
            return moment(fromDate,"YYYY-MM-DD HH:mm Z").fromNow();
        }
        $scope.apply=function(){
         
          if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
               $scope.$apply();
              }
              return false;
        }
        $scope.runTheProcess = function() {
              var params = {'order': $scope.order,
                  'limit': 20}
              Account.list($scope, params);
              var paramsTag = {'about_kind': 'Account'};
              Tag.list($scope, paramsTag);              
              ga('send', 'pageview', '/accounts');
              if (localStorage['accountShow']!=undefined) {
                 $scope.show=localStorage['accountShow'];
              };
              window.Intercom('update');

        };
        $scope.showAttachFilesPicker = function() {
          var developerKey = 'AIzaSyDHuaxvm9WSs0nu-FrZhZcmaKzhvLiSczY';
          var docsView = new google.picker.DocsView()
              .setIncludeFolders(true)
              .setSelectFolderEnabled(true);
          var picker = new google.picker.PickerBuilder().
              addView(new google.picker.DocsUploadView()).
              addView(docsView).
              setCallback($scope.attachmentUploaderCallback).
              setOAuthToken(window.authResult.access_token).
              setDeveloperKey(developerKey).
              setAppId('935370948155-qm0tjs62kagtik11jt10n9j7vbguok9d').
                enableFeature(google.picker.Feature.MULTISELECT_ENABLED).
              build();
          picker.setVisible(true);
      };
      $scope.attachmentUploaderCallback= function(data){
        if (data.action == google.picker.Action.PICKED) {
                $.each(data.docs, function(index) {
                    var file = { 'id':data.docs[index].id,
                                  'title':data.docs[index].name,
                                  'mimeType': data.docs[index].mimeType,
                                  'embedLink': data.docs[index].url
                    };
                    $scope.sendWithAttachments.push(file);
                });
                $scope.apply();
        }
      }
        $scope.smallModal=false;
        $scope.gotosendMail = function(email,lead){
                   $scope.accountToMail=lead;
                   $scope.email.to = email;
                   $('#testnonefade').modal("show");
                   $scope.smallSendMail();
              }
              $('#some-textarea').wysihtml5();
            $scope.switchwysihtml=function(){
              if ($(".wysihtml5-toolbar").is(":visible")) {

                $(".wysihtml5-toolbar").hide();
                $(".wysihtml5-sandbox").addClass("withoutTools");

              }else{

                $(".wysihtml5-sandbox").removeClass("withoutTools")
                $(".wysihtml5-toolbar").show();
                
              };  
            }
            $scope.closeEmailModel=function(){
              $(".modal-backdrop").remove();
               $('#testnonefade').hide();

            }
            $scope.switchEmailModal=function(){
              if ($( "#testnonefade" ).hasClass( "emailModalOnBottom" )) {
                  $scope.bigSendMail();
                  $scope.smallModal=true;
              }else{
                   $scope.smallSendMail();
                   $scope.smallModal=false;
              };
            }
            
            $scope.smallSendMail=function(){
              $(".modal-backdrop").remove();
              $('#testnonefade').addClass("emailModalOnBottom");
            }
            $scope.bigSendMail=function(){
              $('#testnonefade').removeClass("emailModalOnBottom");
              $( "body" ).append( '<div class="modal-backdrop fade in"></div>' );

            }
        $scope.sendEmail = function(email){
        KeenIO.log('send email');
        email.body = $('#some-textarea').val();
        var params = {
                  'to': email.to,
                  'cc': email.cc,
                  'bcc': email.bcc,
                  'subject': email.subject,
                  'body': email.body,
                  'about':$scope.accountToMail.entityKey
                  };
        if ($scope.sendWithAttachments){
            params['files']={
                            'parent':$scope.accountToMail.entityKey,
                            'access':$scope.accountToMail.access,
                            'items':$scope.sendWithAttachments
                            };
        };
        
        Email.send($scope,params,true);       
      };
        $scope.emailSentConfirmation=function(){
            console.log('$scope.email');
            console.log($scope.email);
            $scope.email={};
            $scope.showCC=false;
            $scope.showBCC=false;
            $scope.accountToMail=null;
            $('#testnonefade').modal("hide");
             $scope.email={};
             console.log('$scope.email');
             $scope.emailSentMessage=true;
             setTimeout(function(){  $scope.emailSentMessage=false; $scope.apply() }, 2000);
        }
       /* window.mobilecheck = function() {
          var check = false;
          (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
          return check;
        }
        $scope.onMobileClickPhone=function(phone){
          if (window.mobilecheck) {
            console.log("not mobillllllllllllllllllle");
            return "";
          }else{
            console.log("wooooooooork");
            console.log(window.mobilecheck);
            return "tel:"+phone;

          }

        }*/

// HADJI HICHAM -04/02/2015

   $scope.removeTag = function(tag,account) {
            KeenIO.log('dettach tag from leads/show page');

            /*var params = {'tag': tag,'index':$index}

            Edge.delete($scope, params);*/
            $scope.dragTagItem(tag,account);
            $scope.dropOutTag();
        }


/***********************************************************/

        $scope.getPosition = function(index) {
            if (index < 4) {

                return index + 1;
            } else {
                return (index % 4) + 1;
            }
        };
         $scope.filterByName=function(){
          if ($scope.fltby!='name') {
                console.log($scope.fltby);
                 $scope.fltby = 'name'; $scope.reverse=false
          }else{
                 console.log($scope.fltby);
                 $scope.fltby = '-name'; $scope.reverse=false;
          };
         }
         $scope.switchShow=function(){
          if ($scope.show=='list') {                
             $scope.show = 'cards';
             localStorage['accountShow']="cards";
             $scope.selectedCards =[];
             $("#accountCardsContainer").trigger( 'resize' );
          }else{
                  if ($scope.show=='cards') {
                             $scope.show = 'list';
                              localStorage['accountShow']="list";
                             $scope.selectedCards =[];
                             
                  }
          };
        }
        $scope.isSelectedCard = function(account) {
          return ($scope.selectedCards.indexOf(account) >= 0||$scope.allCardsSelected);
        };
        $scope.unselectAll = function($event){
             var element=$($event.target);
             if(element.hasClass('waterfall')){
                $scope.selectedCards=[];
             };
            /*$scope.selectedCards=[];*/
        }
        $scope.selectAll = function($event){
       
            var checkbox = $event.target;
             if(checkbox.checked){
                $scope.selectedCards=[];
                $scope.selectedCards=$scope.selectedCards.concat($scope.accounts);
                  
                $scope.allCardsSelected=true;

             }else{

              $scope.selectedCards=[];
              $scope.allCardsSelected=false;
              
             }
        };
        $scope.editbeforedeleteselection = function(){
          $('#BeforedeleteSelectedAccounts').modal('show');
        };
        $scope.deleteSelection = function(){
            angular.forEach($scope.selectedCards, function(selected_account){
                var params = {'entityKey':selected_account.entityKey};
                Account.delete($scope, params);
            });
             $('#BeforedeleteSelectedAccounts').modal('hide');
        };
        $scope.accountDeleted=function(){
          if ($scope.selectedAccount) {    
             $scope.accounts.splice($scope.accounts.indexOf($scope.selectedAccount) , 1);
             $scope.apply();
          }else{
            angular.forEach($scope.selectedCards, function(selected_account){
                $scope.accounts.splice($scope.accounts.indexOf(selected_account) , 1);
                $scope.apply();
            });
             
          };
          $scope.selectedCards=[];
        }
        $scope.selectCardwithCheck=function($event,index,account){

            var checkbox = $event.target;

             if(checkbox.checked){
                if ($scope.selectedCards.indexOf(account) == -1) {             
                  $scope.selectedCards.push(account);
                }
             }else{       
                  $scope.selectedCards.splice($scope.selectedCards.indexOf(account) , 1);
             }

        }
        /*$scope.selectCard=function($event,index,account){
             if ($(document).width()>530) {
                 if($scope.selectedCards.indexOf(account) == -1){
                     if (event.ctrlKey==1||event.metaKey==1){
                         console.log(index);
                            $scope.selectedCards.push(account);
                        }else{
                             $scope.selectedCards=[];
                             $scope.selectedCards.push(account);
                        }
                 }else{
                   if (event.ctrlKey==1||event.metaKey==1){
                        $scope.selectedCards.splice($scope.selectedCards.indexOf(account), 1);
                    }else{
                         $scope.selectedCards=[];
                         $scope.selectedCards.push(account);
                    }
                    

                 }
              }
        }*/

        // We need to call this to refresh token when user credentials are invalid
        $scope.refreshToken = function() {
            Auth.refreshToken();
        };
            $scope.editbeforedelete = function(account){
                 $scope.selectedAccount=account;
                 $('#BeforedeleteAccount').modal('show');
             };
            $scope.deleteaccount = function(){
                 console.log($scope.selectedAccount);
                 var params = {'entityKey':$scope.selectedAccount.entityKey};
                 Account.delete($scope, params);
                 $('#BeforedeleteAccount').modal('hide');                 
             };
            $scope.showAssigneeTags=function(account){
              if (account) {                  
                $scope.currentAccount=account;
              }
                $('#assigneeTagsToAccount').modal('show');
             };
           $scope.addTagstoAccounts=function(){
                var tags=[];
                var items = [];
                tags=$('#select2_sample2').select2("val");
                console.log(tags);
                if ($scope.currentAccount!=null) {
                  angular.forEach(tags, function(tag){
                           var params = {
                             'parent': $scope.currentAccount.entityKey,
                             'tag_key': tag
                          };
                          console.log("this is the index ");
                          console.log($scope.accounts.indexOf($scope.currentAccount));

                         Tag.attach($scope, params,$scope.accounts.indexOf($scope.currentAccount));
                        });
                  $scope.currentAccount=null;
                }else{
                  angular.forEach($scope.selectedCards, function(selected_account){
                    angular.forEach(tags, function(tag){
                      var params = {
                        'parent': selected_account.entityKey,
                        'tag_key': tag
                      };
                       Tag.attach($scope, params);
                    });

                });
                }
                $scope.apply();
                $scope.clearTagsModel("select2_sample2");
                $('#assigneeTagsToAccount').modal('hide');
               };
            $scope.addTagsTothis=function(){
              var tags=[];
              var items = [];
              tags=$('#select2_sample2').select2("val");              
                  angular.forEach(tags, function(tag){
                    var edge = {
                      'start_node': $scope.currentAccount.entityKey,
                      'end_node': tag,
                      'kind':'tags',
                      'inverse_edge': 'tagged_on'
                    };
                    items.push(edge);
                  });
              params = {
                'items': items
              }
              Edge.insert($scope,params);
              $scope.currentAccount=null;
              $('#assigneeTagsToAccount').modal('hide');
             };
            $scope.showNewTagForm=function(){
              $scope.showNewTag=true;
              $( window ).trigger( 'resize' );  
            }
            $scope.hideNewTagForm=function(){
              $scope.showNewTag=false;
              $( window ).trigger( 'resize' ); 
            }
            $scope.hideTagFilterCard=function(){
              $scope.showTagsFilter=false;
              $( window ).trigger( 'resize' ); 
            }
            $scope.showTagFilterCard=function(){
              $scope.showTagsFilter=true;
              $( window ).trigger( 'resize' ); 
            }
        // Next and Prev pagination
        $scope.listNextPageItems = function() {
            var nextPage = $scope.currentPage + 1;
            var params = {};
            if ($scope.pages[nextPage]) {
                params = {'limit': 6,
                    'order': $scope.order,
                    'pageToken': $scope.pages[nextPage]
                }
            } else {
                params = {'order': $scope.order, 'limit': 6}
            }
            $scope.currentPage = $scope.currentPage + 1;
            Account.list($scope, params);
        };
        $scope.listMoreItems = function() {
            var nextPage = $scope.currentPage + 1;
            var params = {};
            if ($scope.pages[nextPage]) {
                params = {
                    'limit': 20,
                    'order': $scope.order,
                    'pageToken': $scope.pages[nextPage]
                }
                $scope.currentPage = $scope.currentPage + 1;
                Account.listMore($scope, params);
            }
        };
        $scope.listPrevPageItems = function() {
            var prevPage = $scope.currentPage - 1;
            var params = {};
            if ($scope.pages[prevPage]) {
                params = {'limit': 6,
                    'order': $scope.order,
                    'pageToken': $scope.pages[prevPage]
                }
            } else {
                params = {'order': $scope.order, 'limit': 6}
            }
            $scope.currentPage = $scope.currentPage - 1;
            Account.list($scope, params);
        };
        // Add a new account methods
        // Show the modal
        $scope.showModal = function() {
            $('#addAccountModal').modal('show');
        };
        // Insert the account if enter button is pressed
        $scope.addAccountOnKey = function(account) {
            if (event.keyCode == 13 && account) {
                $scope.save(account);
            }
            ;
        };
        $scope.addAccountOnKey = function(account) {
            if (event.keyCode == 13 && account) {
                $scope.save(account);
            }


        };

        $scope.accountInserted = function(resp) {
            if ($scope.accounts == undefined) {
                $scope.accounts = [];
                $scope.blankStateaccount = false;
            }
            $scope.account.name = '';
            $scope.accounts.push(resp);
            $scope.apply();
        };
        // Quick Filtering
        var searchParams = {};
        $scope.result = undefined;
        $scope.q = undefined;




// hadji hicham 23-07-2014 . inlinepatch for labels .
  $scope.inlinePatch=function(kind,edge,name,tag,value){
         
        if(kind=="tag"){

        params={'id':tag.id,
                'entityKey':tag.entityKey,
                'about_kind':'Lead',
                'name':value
                  };


           Tag.patch($scope,params);
      };



             }
        $scope.selectResult = function() {
            window.location.replace('#/accounts/show/' + $scope.searchQuery.id);
        };
        $scope.executeSearch = function(searchQuery) {
            if (typeof (searchQuery) == 'string') {
                var goToSearch = 'type:Account ' + searchQuery;
                window.location.replace('#/search/' + goToSearch);
            } else {
                window.location.replace('#/accounts/show/' + searchQuery.id);
            }
            $scope.searchQuery = ' ';
            $scope.apply();
        };
        // Sorting
        $scope.orderBy = function(order) {

            var params = {'order': order};
            $scope.order = order;
            Account.list($scope, params);
        };
        $scope.filterByOwner = function(filter) {
            if (filter) {
                var params = {'owner': filter,
                    'order': $scope.order
                }
            }
            else {
                var params = {
                    'order': $scope.order
                }
            }
            ;
            $scope.isFiltering = true;
            Account.list($scope, params);
        };

        /***********************************************
         HKA 14.02.2014  tags
         ***************************************************************************************/
        $scope.listTags = function() {
            var paramsTag = {'about_kind': 'Account'}
            Tag.list($scope, paramsTag);

        };
        $scope.edgeInserted = function() {
            $scope.listaccounts();
        };
        $scope.listaccounts = function() {
            var params = {'order': $scope.order,
                'limit': 20/*,
                 'pageToken':$scope.pages[currentPage]*/}
            Account.list($scope, params);
        };


        $scope.addNewtag = function(tag) {
            var params = {
                'name': tag.name,
                'about_kind': 'Account',
                'color': tag.color.color
            };
            Tag.insert($scope, params);

            var paramsTag = {'about_kind': 'Account'};
            Tag.list($scope, paramsTag);
            tag.name = '';
            $scope.tag.color = {'name': 'green', 'color': '#BBE535'};


        }
        $scope.updateTag = function(tag) {
            params = {'id': tag.id,
                'title': tag.name,
                'status': tag.color
            };
            Tag.patch($scope, params);
        };
        $scope.deleteTag = function(tag) {
            params = {
                'entityKey': tag.entityKey
            }
            Tag.delete($scope, params);

        };

        $scope.listTags = function() {
            var paramsTag = {'about_kind': 'Account'};
            Tag.list($scope, paramsTag);
        };

        $scope.selectTag = function(tag, index, $event) {
            if (!$scope.manage_tags) {
                var element = $($event.target);
                if (element.prop("tagName") != 'LI') {
                    element = element.parent().closest('LI');
                }
                var text = element.find(".with-color");
                if ($scope.selected_tags.indexOf(tag) == -1) {
                    $scope.selected_tags.push(tag);
                   /* element.css('background-color', tag.color + '!important');
                    text.css('color', $scope.idealTextColor(tag.color));*/

                } else {
                   /* element.css('background-color', '#ffffff !important');*/
                    $scope.selected_tags.splice($scope.selected_tags.indexOf(tag), 1);
                   /* text.css('color', $scope.idealTextColor(tag.color));*/
                }

                $scope.filterByTags($scope.selected_tags);

            }

        };
        $scope.filterByTags = function(selected_tags) {


            var tags = [];
            angular.forEach(selected_tags, function(tag) {
                tags.push(tag.entityKey);
            });
            var params = {
                'tags': tags,
                'order': $scope.order,
                'limit': 20
            };
            $scope.isFiltering = true;
            Account.list($scope, params);

        };

        $scope.unselectAllTags = function() {
            $('.tags-list li').each(function() {
                var element = $(this);
                var text = element.find(".with-color");
                element.css('background-color', '#ffffff !important');
                text.css('color', '#000000');
            });
        };
//HKA 19.02.2014 When delete tag render account list
        $scope.tagDeleted = function() {
             $scope.listTags();
             $scope.listaccounts();
        };
        $scope.tagUnattached = function() {
          console.log("inter to tagDeleted");
            $scope.accounttoUnattachTag.tags.splice($scope.accounttoUnattachTag.tags.indexOf($scope.tagtoUnattach),1)
            $scope.apply()
        };


        $scope.manage = function() {
            $scope.unselectAllTags();
        };
        $scope.tag_save = function(tag) {
            if (tag.name) {
                Tag.insert($scope, tag);

            }
            ;
        };
        $scope.hideEditable=function(index,tag){

      document.getElementById("tag_"+index).style.backgroundColor=tag.color;
      document.getElementById("closy_"+index).removeAttribute("style");
      document.getElementById("checky_"+index).style.display="inline";

          $scope.hideeverything=false;
          $scope.edited_tag=null;

        }
        $scope.editTag = function(tag,index) {
          document.getElementById("tag_"+index).style.backgroundColor="white";
          document.getElementById("closy_"+index).style.display="none";
          document.getElementById("checky_"+index).style.display="none";
            
            $scope.edited_tag = tag;
        }
        $scope.doneEditTag = function(tag) {

            $scope.edited_tag = null;
            $scope.updateTag(tag);
        }
        /*$scope.addTags = function() {
            var tags = [];
            var items = [];
            tags = $('#select2_sample2').select2("val");

            angular.forEach($scope.selected_tasks, function(selected_task) {
                angular.forEach(tags, function(tag) {
                    var edge = {
                        'start_node': selected_task.entityKey,
                        'end_node': tag,
                        'kind': 'tags',
                        'inverse_edge': 'tagged_on'
                    };
                    items.push(edge);
                });
            });

            params = {
                'items': items
            }

            Edge.insert($scope, params);
            $('#assigneeTagsToTask').modal('hide');

        };*/

        var handleColorPicker = function() {
            if (!jQuery().colorpicker) {
                return;

            }
            $('.colorpicker-default').colorpicker({
                format: 'hex'
            });
        }
        handleColorPicker();

        $('#addMemberToTask > *').on('click', null, function(e) {
            e.stopPropagation();
        });
        $scope.idealTextColor = function(bgColor) {
            var nThreshold = 105;
            var components = getRGBComponents(bgColor);
            var bgDelta = (components.R * 0.299) + (components.G * 0.587) + (components.B * 0.114);

            return ((255 - bgDelta) < nThreshold) ? "#000000" : "#ffffff";
        }
        function getRGBComponents(color) {

            var r = color.substring(1, 3);
            var g = color.substring(3, 5);
            var b = color.substring(5, 7);

            return {
                R: parseInt(r, 16),
                G: parseInt(g, 16),
                B: parseInt(b, 16)
            };
        }
        $scope.dragTag = function(tag) {
            $scope.draggedTag = tag;

        }
        $scope.disassociate = function(tag) {
            $scope.disassociated = tag;

        }
        $scope.inTag = function(tag) {

            $scope.disassociated = tag;

        }
        $scope.dropTag = function(account, index) {
            var items = [];
            var params = {
                'parent': account.entityKey,
                'tag_key': $scope.draggedTag.entityKey
            };
            $scope.draggedTag = null;
            Tag.attach($scope, params, index);
            $scope.apply();
        };
        $scope.dropOutTag = function() {

            var params = {'entityKey': $scope.edgekeytoDelete}
            Edge.delete($scope, params);
            $scope.edgekeytoDelete = undefined;
            $scope.showUntag = false;

        }
        $scope.dragTagItem = function(tag,account) {

            $scope.showUntag = true;
            $scope.edgekeytoDelete = tag.edgeKey;
            $scope.tagtoUnattach = tag;
            $scope.accounttoUnattachTag = account;
        }
        $scope.tagattached = function(tag, index) {

          if (index!=undefined) {
            if ($scope.accounts[index].tags == undefined) {
                $scope.accounts[index].tags = [];
            }
            var ind = $filter('exists')(tag, $scope.accounts[index].tags);
            console.log('index :');
            console.log(index);            
            console.log(ind);            
            if (ind == -1) {
                $scope.accounts[index].tags.push(tag);
                var card_index = '#card_' + index;
                $(card_index).removeClass('over');
            } else {
                var card_index = '#card_' + index;
                $(card_index).removeClass('over');
            }
          }else{

             if ($scope.selectedCards.length >0) {
                angular.forEach($scope.selectedCards, function(selected_account){
                    var existstag=false;
                    angular.forEach(selected_account.tags, function(elementtag){
                        if (elementtag.id==tag.id) {
                           existstag=true;
                        };                       
                    }); 
                    if (!existstag) {
                       if (selected_account.tags == undefined) {
                          selected_account.tags = [];
                          }
                       selected_account.tags.push(tag);
                    };  
                 });        
           /* $scope.selectedCards=[];*/
             };
          };
          $scope.apply();
        };
        $scope.clearTagsModel=function(id){
            $('#'+id).select2("val", "");
        }

        // HKA 12.03.2014 Pallet color on Tags
        $scope.checkColor = function(color) {
            $scope.tag.color = color;
        }



        // Google+ Authentication
        Auth.init($scope);
        $(window).scroll(function() {
            if (!$scope.isLoading && !$scope.isFiltering && ($(window).scrollTop() > $(document).height() - $(window).height() - 100)) {
                $scope.listMoreItems();
            }
        });

    }]);
app.controller('AccountShowCtrl', ['$scope', '$filter', '$route', 'Auth', 'Account', 'Contact', 'Case', 'Opportunity', 'Topic', 'Note', 'Task', 'Event', 'Permission', 'User', 'Attachement', 'Email', 'Opportunitystage', 'Casestatus', 'Map', 'InfoNode', 'Tag','Edge',
    function($scope, $filter, $route, Auth, Account, Contact, Case, Opportunity, Topic, Note, Task, Event, Permission, User, Attachement, Email, Opportunitystage, Casestatus, Map, InfoNode, Tag, Edge) {
        $("ul.page-sidebar-menu li").removeClass("active");
        $("#id_Accounts").addClass("active");

        $scope.selectedTab = 2;
        $scope.isSignedIn = false;
        $scope.immediateFailed = false;
        $scope.nextPageToken = undefined;
        $scope.prevPageToken = undefined;
        $scope.isLoading = false;
        $scope.nbLoads=0;
        $scope.pagination = {};
        $scope.currentPage = 01;
        //HKA 10.12.2013 Var topic to manage Next & Prev
        $scope.topicCurrentPage = 01;
        $scope.topicpagination = {};
        $scope.topicpages = [];
        //HKA 10.12.2013 Var Contact to manage Next & Prev
        $scope.contactpagination = {};
        $scope.contactCurrentPage = 01;
        $scope.contactpages = [];
        //HKA 11.12.2013 var Opportunity to manage Next & Prev
        $scope.opppagination = {};
        $scope.oppCurrentPage = 01;
        $scope.opppages = [];
        $scope.customfields=[];
        $scope.companydetails={};
        $scope.twitterProfile={};
        //HKA 11.12.2013 var Case to manage Next & Prev
        $scope.casepagination = {};
        $scope.caseCurrentPage = 01;
        $scope.casepages = [];
        $scope.needspagination = {};
        $scope.needsCurrentPage = 01;
        $scope.needspages = [];
        $scope.documentpagination = {};
        $scope.documentCurrentPage = 01;
        $scope.documentpages = [];
        $scope.collaborators_list=[]
        $scope.pages = [];
        $scope.accounts = [];
        $scope.account={};
        $scope.users = [];
        $scope.user = undefined;
        $scope.slected_memeber = undefined;
        $scope.email = {};
        $scope.stage_selected = {};
        $scope.status_selected = {};
        $scope.infonodes = {};
        $scope.phone = {};
        $scope.phone.type = 'work';
        $scope.need = {};
        $scope.need.need_status = 'pending';
        $scope.need.priority = 'Medium';
        $scope.casee = {};
        $scope.casee.priority = 4;
        $scope.casee.status = 'pending';
        $scope.addingTask = false;
        $scope.sharing_with = [];
        $scope.edited_email = null;
        $scope.currentParam = {};
        $scope.showPhoneForm = false;
        $scope.showEmailForm = false;
        $scope.showWebsiteForm = false;
        $scope.showSociallinkForm = false;
        $scope.showCustomFieldForm = false;
        $scope.opportunities = [];
        $scope.phones = [];
        $scope.emails = [];
        $scope.newTaskform = false;
        $scope.selected_members = [];
        $scope.selected_member = {};
        $scope.opportunities = {};
        $scope.statuses = [
            {value: 'Home', text: 'Home'},
            {value: 'Work', text: 'Work'},
            {value: 'Mob', text: 'Mob'},
            {value: 'Other', text: 'Other'}
        ];
        $scope.showUpload = false;
        $scope.logo = {
            'logo_img_id': null,
            'logo_img_url': null
        };

        $scope.editdata = {'edit': 'test()'};
        $scope.percent = 0;
        $scope.chartOptions = {animate:{duration:0,enabled:false},size:100,barColor:'#58a618',scaleColor:false,lineWidth:7,lineCap:'circle'};
        $scope.closed_date = new Date();
        $scope.newTaskform=false;
        $scope.newEventform=false;
        $scope.newTask={};
        $scope.ioevent = {};
        $scope.showNewOpp=false;
        $scope.showNewCase=false;
        $scope.showNewContact=false;
        $scope.opportunity={access:'public',currency:'USD',duration_unit:'fixed',closed_date:new Date()};
        $scope.selectedItem={};
        $scope.relatedCase=true;
        $scope.relatedOpp=true;
        $scope.selected_tags=[];
        $scope.showPage=true;
        $scope.ownerSelected={};
        $scope.sendWithAttachments = [];
        $scope.smallModal=false;
        $('#some-textarea').wysihtml5();
        $scope.inProcess=function(varBool,message){
          if (varBool) {  
            console.log("inProcess starts");      
            if (message) {
              console.log("starts of :"+message);
             
            };
            $scope.nbLoads=$scope.nbLoads+1;
             var d = new Date();
             console.log(d.getTime());
            if ($scope.nbLoads==1) {
              $scope.isLoading=true;
            };
          }else{
            if (message) {
              console.log("ends of :"+message);
            };
            console.log("inProcess ends");
            var d = new Date();
            console.log(d.getTime());
            $scope.nbLoads=$scope.nbLoads-1;
            if ($scope.nbLoads==0) {
               $scope.isLoading=false;
 
            };

          };
        }        
        $scope.apply=function(){
         
          if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
               $scope.$apply();
              }
              return false;
        }
        $scope.contact_img={};
        $scope.imageSrcContact= '/static/img/avatar_contact.jpg';;
        // What to do after authentication
        $scope.endError = function() {
            //alert("okkkkkkkkkkkkkkk");
        }
        
        $scope.prepareInfonodes = function(){
            var infonodes = [];

            angular.forEach($scope.customfields, function(customfield){
                var infonode = {
                                'kind':'customfields',
                                'fields':[
                                        {
                                        'field':customfield.field,
                                        'value':customfield.value
                                        }
                                ]

                              }
                infonodes.push(infonode);
            });
            return infonodes;
        };
       /* $scope.safeApply = function(fn) {
          var phase = this.$root.$$phase;
          if(phase == '$apply' || phase == '$digest') {
            if(fn && (typeof(fn) === 'function')) {
              fn();
            }
          } else {
            this.$apply(fn);
          }
        };*/
        $scope.gotosendMail = function(email){
            $scope.email.to = email;
             $('#testnonefade').modal("show");
            $scope.smallSendMail();
            //  $(".wysihtml5-toolbar").hide();
        }
         $scope.switchwysihtml=function(){
          if ($(".wysihtml5-toolbar").is(":visible")) {

            $(".wysihtml5-toolbar").hide();
            $(".wysihtml5-sandbox").addClass("withoutTools");

          }else{

            $(".wysihtml5-sandbox").removeClass("withoutTools")
            $(".wysihtml5-toolbar").show();

          };  
        }
        $scope.closeEmailModel=function(){
          $(".modal-backdrop").remove();
           $('#testnonefade').hide();

        }
        $scope.switchEmailModal=function(){
          if ($( "#testnonefade" ).hasClass( "emailModalOnBottom" )) {
              $scope.bigSendMail();
              $scope.smallModal=true;
          }else{
               $scope.smallSendMail();
               $scope.smallModal=false;
          };
        }
        
        $scope.smallSendMail=function(){
          $(".modal-backdrop").remove();
          $('#testnonefade').addClass("emailModalOnBottom");
        }
        $scope.bigSendMail=function(){
          $('#testnonefade').removeClass("emailModalOnBottom");
          $( "body" ).append( '<div class="modal-backdrop fade in"></div>' );

        }
           $scope.savecontact = function(contact) {
            console.log("started");
            var params ={
                        'firstname':contact.firstname,
                        'lastname':contact.lastname,
                        'title':contact.title,
                        'tagline':contact.tagline,
                        'introduction':contact.introduction,
                        'phones':$scope.phones,
                        'emails':$scope.emails,
                        'addresses':$scope.addresses,
                        'infonodes':$scope.prepareInfonodes(),
                        'access': contact.access,
                        'account': $scope.account.entityKey
                         };
                        if ($scope.contact_img.id){
                                params['profile_img_id'] = $scope.contact_img.id;
                                params['profile_img_url'] = 'https://docs.google.com/uc?id='+$scope.contact_img.id;
                        }
                        Contact.insert($scope,params);
                        $scope.contact={};
                        $scope.showNewContact=false;
        };
  $scope.saveOpp = function(opportunity){

            opportunity.closed_date = $filter('date')(opportunity.closed_date,['yyyy-MM-dd']);
            opportunity.stage = $scope.initialStage.entityKey;
            opportunity.infonodes = $scope.prepareInfonodes();
            if (opportunity.duration_unit=='fixed'){

              opportunity.amount_total = opportunity.amount_per_unit;
              opportunity.opportunity_type = 'fixed_bid';

            }else{

              opportunity.opportunity_type = 'per_' + opportunity.duration;

            }
            opportunity.account=$scope.account.entityKey;
            Opportunity.insert($scope,opportunity);
            $scope.showNewOpp=false;
            $scope.opportunity={access:'public',currency:'USD',duration_unit:'fixed',closed_date:new Date()};

};
       $scope.priorityColor=function(pri){
          if (pri<4) {
              return '#BBE535';
          }else{
            if (pri<6) {
                 return '#EEEE22';
            }else{
              if (pri<8) {
                   return '#FFBB22';
               }else{
                   return '#F7846A';
               }    
            }  
          }
         }
          
          $scope.hideNewContactForm=function(){
            $scope.contact={};
            $scope.showNewContact=false;
            $( window ).trigger( 'resize' ); 
         }
         $scope.hideNewCaseForm=function(){
            $scope.casee={};
            $scope.casee.priority = 4;
            $scope.showNewCase=false;
            $( window ).trigger( 'resize' ); 
         }
         $scope.hideNewOppForm=function(){
            $scope.opportunity={};
            $scope.showNewOpp=false;
            $( window ).trigger( 'resize' ); 
         }
        // HKA 01.12.2013 Add Case related to Contact
        $scope.saveCase = function(casee) {
            casee.account=$scope.account.entityKey;
            casee.access=$scope.account.access;
            casee.infonodes = $scope.prepareInfonodes();
            casee.status = $scope.status_selected.entityKey;           
            Case.insert($scope,casee);      
            $scope.showNewCase=false;
            $scope.casee={};
        };
        $scope.addTagsTothis=function(){
              var tags=[];
              var items = [];
              tags=$('#select2_sample2').select2("val");
              console.log(tags);
                  angular.forEach(tags, function(tag){
                    var params = {
                          'parent': $scope.account.entityKey,
                          'tag_key': tag
                    };
                    Tag.attach($scope,params);
                  });
          };
         $scope.edgeInserted = function() {
          /* $scope.tags.push()*/
          };
         $scope.removeTag = function(tag,$index) {
            var params = {'tag': tag,'index':$index}
            Edge.delete($scope, params);
        }
        $scope.edgeDeleted=function(index){
         $scope.account.tags.splice(index, 1);
         $scope.apply();
        }
         $scope.editbeforedelete = function(item,typee,index){
            $scope.selectedItem={'item':item,'typee':typee,'index':index};
            $('#BeforedeleteAccount').modal('show');
         };
         $scope.deleteItem=function(){
            var params = {'entityKey':$scope.selectedItem.item.entityKey};
            console.log(params);
            if ($scope.selectedItem.typee=='account') {
                Account.delete($scope, params);
            }else{
                if ($scope.selectedItem.typee=='contact') {
                 Contact.delete($scope, params);                 
                }else{
                    if ($scope.selectedItem.typee=='opportunity') {
                         Opportunity.delete($scope, params);
                    }else{
                        if ($scope.selectedItem.typee=='case') {
                             Case.delete($scope, params);
                        };
                    }
                }    
            }
            
             $('#BeforedeleteAccount').modal('hide');
         }
         $scope.contactDeleted = function(resp){
               $scope.contacts.splice($scope.selectedItem.index, 1);
               $scope.apply();
               $scope.waterfallTrigger();
         };
         $scope.caseDeleted = function(resp){
               $scope.cases.splice($scope.selectedItem.index, 1);
               $scope.apply();
               $scope.waterfallTrigger();
         };
        $scope.oppDeleted = function(resp){
               $scope.opportunities.splice($scope.selectedItem.index, 1);
               $scope.apply();
               $scope.waterfallTrigger();
         };


        $scope.fromNow = function(fromDate){
            return moment(fromDate,"YYYY-MM-DD HH:mm Z").fromNow();
        }
        $scope.runTheProcess = function() {

            var params = {
                'id': $route.current.params.accountId,
                'topics': {
                    'limit': '7'
                },
                'contacts': {
                    'limit': '15'
                },
                'opportunities': {
                    'limit': '15'
                },
                'cases': {
                    'limit': '15'
                },
                'documents': {
                    'limit': '15'
                },
                'tasks': {
                },
                'events': {
                }


            };
            Account.get($scope, params);
            User.list($scope, {});
            Opportunitystage.list($scope, {'order':'probability'});
            Casestatus.list($scope, {});
            var paramsTag = {'about_kind': 'Account'};
            Tag.list($scope, paramsTag);
            console.log("aaaaaafteeeer");
            ga('send', 'pageview', '/accounts/show');
            window.Intercom('update');

        };
        $scope.mapAutocomplete=function(){
            $scope.addresses = $scope.account.addresses;
            Map.autocomplete ($scope,"pac-input");
        }
        $scope.getColaborators=function(){
          Permission.getColaborators($scope,{"entityKey":$scope.account.entityKey});  
        } 
        $scope.getCompanyDetails=function(entityKey){
               Account.getCompanyDetails($scope,{'entityKey':entityKey})
               Account.get_twitter($scope,{'entityKey':entityKey})
               console.log('getCompanyDetails');
               console.log( $scope.companydetails);
               console.log('get-twitter');
               console.log($scope.twitterProfile);
                
        }
        $scope.noCompanyDetails=function(){
            if (jQuery.isEmptyObject($scope.companydetails)&&jQuery.isEmptyObject($scope.twitterProfile)) {
                return true;
            }else{
                return false;
            };
        }
        $scope.isEmptyArray=function(Array){
                if (Array!=undefined && Array.length>0) {
                return false;
                }else{
                    return true;
                };    
            
        }
        $scope.companydetailsEmpty=function(){
            if (jQuery.isEmptyObject($scope.companydetails)) {
                return true;
            }else{
                return false;
            };
        }
        $scope.twitterProfileEmpty=function(){
            if (jQuery.isEmptyObject($scope.companydetails)) {
                return true;
            }else{
                return false;
            };
        }
        $scope.selectMemberToTask = function() {
            console.log($scope.selected_members);
            if ($scope.selected_members.indexOf($scope.user) == -1) {
                $scope.selected_members.push($scope.user);
                $scope.selected_member = $scope.user;
                $scope.user = $scope.selected_member.google_display_name;
            }
            $scope.user = '';
        };
        $scope.unselectMember = function(index) {
            $scope.selected_members.splice(index, 1);
            console.log($scope.selected_members);
        };
        $scope.preparePercent = function(percent) {

            return parseInt(percent);
        };
        $scope.getPosition = function(index) {
            if (index < 4) {

                return index + 1;
            } else {
                return (index % 4) + 1;
            }
        };
        $scope.waterfallTrigger = function() {


            /* $('.waterfall').hide();
             $('.waterfall').show();*/
            $(window).trigger("resize");
        };

        // We need to call this to refresh token when user credentials are invalid
        $scope.refreshToken = function() {
            Auth.refreshToken();
        };
        //HKA 06.12.2013  Manage Next & Prev Page of Topics
        $scope.TopiclistNextPageItems = function() {


            var nextPage = $scope.topicCurrentPage + 1;
            var params = {};
            if ($scope.topicpages[nextPage]) {
                params = {
                    'id': $scope.account.id,
                    'topics': {
                        'limit': '7',
                        'pageToken': $scope.topicpages[nextPage]
                    }
                }
                $scope.topicCurrentPage = $scope.topicCurrentPage + 1;
                Account.get($scope, params);
            }


        }
        $scope.editTrigger = function(name) {
            name.$show();
        }
        // HKA 08.05.2014 Delete infonode

        $scope.deleteInfonode = function(entityKey, kind) {
            var params = {'entityKey': entityKey, 'kind': kind};

            InfoNode.delete($scope, params);


        };
        $scope.TopiclistPrevPageItems = function() {

            var prevPage = $scope.topicCurrentPage - 1;
            var params = {};

            if ($scope.topicpages[prevPage]) {
                params = {
                    'id': $scope.account.id,
                    'topics': {
                        'limit': '7',
                        'pageToken': $scope.topicpages[prevPage]
                    }
                }
            } else {
                params = {
                    'id': $scope.account.id,
                    'topics': {
                        'limit': '7'
                    }
                }
            }
            $scope.topicCurrentPage = $scope.topicCurrentPage - 1;
            Account.get($scope, params);

        }
        $scope.listTags=function(){
              var paramsTag = {'about_kind':'Account'}
              Tag.list($scope,paramsTag);
             };
        $scope.tagattached = function(tag, index) {
            if ($scope.account.tags == undefined) {
                $scope.account.tags = [];
            }
            var ind = $filter('exists')(tag, $scope.account.tags);
            if (ind == -1) {
                $scope.account.tags.push(tag);
                
            } else {
            }
            $('#select2_sample2').select2("val", "");
            $scope.apply();
        };
//HKA 06.12.2013 Manage Prev & Next Page on Related List Contact
        $scope.ContactlistNextPageItems = function() {


            var nextPage = $scope.contactCurrentPage + 1;
            var params = {};
            if ($scope.contactpages[nextPage]) {
                params = {
                    'id': $scope.account.id,
                    'contacts': {
                        'limit': '15',
                        'pageToken': $scope.contactpages[nextPage]
                    }
                }
                $scope.contactCurrentPage = $scope.contactCurrentPage + 1;
                Account.get($scope, params);
            }
        }
        $scope.ContactlistPrevPageItems = function() {

            var prevPage = $scope.contactCurrentPage - 1;
            var params = {};
            if ($scope.contactpages[prevPage]) {
                params = {
                    'id': $scope.account.id,
                    'contacts': {
                        'limit': '6',
                        'pageToken': $scope.contactpages[prevPage]
                    }
                }
            } else {
                params = {
                    'id': $scope.account.id,
                    'contacts': {
                        'limit': '6'
                    }
                }
            }
            $scope.contactCurrentPage = $scope.contactCurrentPage - 1;
            Account.get($scope, params);
        }
/// update account with inlineEdit
        $scope.inlinePatch = function(kind, edge, name, entityKey, value) {
            if (kind == 'Account') {
                params = {'id': $scope.account.id,
                    name: value}
                Account.patch($scope, params);
            } else {
                console.log('name');
                console.log(name);
                params = {
                    'entityKey': entityKey,
                    'parent': $scope.account.entityKey,
                    'kind': edge,
                    'fields': [
                        {
                            "field": name,
                            "value": value
                        }
                    ]
                };
                console.log('Infonode params');
                console.log(params);
                InfoNode.patch($scope, params);
            }


        };


//HKA 07.12.2013 Manage Prev & Next Page on Related List Opportunities
        $scope.OpplistNextPageItems = function() {


            var nextPage = $scope.oppCurrentPage + 1;
            var params = {};
            if ($scope.opppages[nextPage]) {
                params = {
                    'id': $scope.account.id,
                    'opportunities': {
                        'limit': '15',
                        'pageToken': $scope.opppages[nextPage]
                    }
                }
                $scope.oppCurrentPage = $scope.oppCurrentPage + 1;
                Account.get($scope, params);
            }

        }

        //HKA 07.12.2013 Manage Prev & Next Page on Related List Cases
        $scope.CaselistNextPageItems = function() {


            var nextPage = $scope.caseCurrentPage + 1;
            var params = {};
            if ($scope.casepages[nextPage]) {
                params = {
                    'id': $scope.account.id,
                    'cases': {
                        'limit': '15',
                        'pageToken': $scope.casepages[nextPage]
                    }
                }
                $scope.caseCurrentPage = $scope.caseCurrentPage + 1;
                Account.get($scope, params);
            }

        }
        $scope.CasePrevPageItems = function() {

            var prevPage = $scope.caseCurrentPage - 1;
            var params = {};
            if ($scope.casepages[prevPage]) {
                params = {
                    'id': $scope.account.id,
                    'cases': {
                        'limit': '6',
                        'pageToken': $scope.casepages[prevPage]
                    }
                }
            } else {
                params = {
                    'id': $scope.account.id,
                    'cases': {
                        'limit': '6'
                    }
                }
            }
            $scope.caseCurrentPage = $scope.caseCurrentPage - 1;
            Account.get($scope, params);
        };
        $scope.NeedlistNextPageItems = function() {


            var nextPage = $scope.needsCurrentPage + 1;
            var params = {};
            if ($scope.needspages[nextPage]) {
                params = {
                    'id': $scope.account.id,
                    'needs': {
                        'limit': '6',
                        'pageToken': $scope.needspages[nextPage]
                    }
                }

            } else {
                params = {
                    'id': $scope.account.id,
                    'needs': {
                        'limit': '6'
                    }
                }
            }
            $scope.needsCurrentPage = $scope.needsCurrentPage + 1;
            Account.get($scope, params);
        }
        $scope.NeedPrevPageItems = function() {

            var prevPage = $scope.needsCurrentPage - 1;
            var params = {};
            if ($scope.needspages[prevPage]) {
                params = {
                    'id': $scope.account.id,
                    'needs': {
                        'limit': '6',
                        'pageToken': $scope.needspages[prevPage]
                    }
                }
            } else {
                params = {
                    'id': $scope.account.id,
                    'needs': {
                        'limit': '6'
                    }
                }
            }
            $scope.needsCurrentPage = $scope.needsCurrentPage - 1;
            Account.get($scope, params);
        };
        // HKA 09.02.2014 Manage Next Prev page on ducument list
        $scope.DocumentlistNextPageItems = function() {


            var nextPage = $scope.documentCurrentPage + 1;
            var params = {};
            if ($scope.documentpages[nextPage]) {
                params = {
                    'id': $scope.account.id,
                    'documents': {
                        'limit': '15',
                        'pageToken': $scope.documentpages[nextPage]
                    }
                }
                $scope.documentCurrentPage = $scope.documentCurrentPage + 1;

                Account.get($scope, params);
            }


        }


        $scope.listTopics = function(account) {
            var params = {
                'id': $scope.account.id,
                'topics': {
                    'limit': '7'
                }
            };
            Account.get($scope, params);

        }
        $scope.listDocuments = function() {
            var params = {
                'id': $scope.account.id,
                'documents': {
                    'limit': '15'
                }
            }
            Account.get($scope, params);

        }

        $scope.hilightTopic = function() {

            $('#topic_0').effect("bounce", "slow");
            $('#topic_0 .message').effect("highlight", "slow");
        }


        $scope.selectMember = function() {
            $scope.slected_memeber = $scope.user;
            $scope.user = '';
            $scope.sharing_with.push($scope.slected_memeber);

        };
        $scope.showCreateDocument = function(type) {

            $scope.mimeType = type;
            $('#newDocument').modal('show');
        };
        $scope.createDocument = function(newdocument) {
            var mimeType = 'application/vnd.google-apps.' + $scope.mimeType;
            var params = {
                'parent': $scope.account.entityKey,
                'title': newdocument.title,
                'mimeType': mimeType
            };
            Attachement.insert($scope, params);

        };
        $scope.createPickerUploader = function() {
            var projectfolder = $scope.account.folder;
            var developerKey = 'AIzaSyDHuaxvm9WSs0nu-FrZhZcmaKzhvLiSczY';
            var docsView = new google.picker.DocsView()
                    .setIncludeFolders(true)
                    .setSelectFolderEnabled(true);
            var picker = new google.picker.PickerBuilder().
                    addView(new google.picker.DocsUploadView().setParent(projectfolder)).
                    addView(docsView).
                    setCallback($scope.uploaderCallback).
                    setOAuthToken(window.authResult.access_token).
                    setDeveloperKey(developerKey).
                    setAppId('935370948155-qm0tjs62kagtik11jt10n9j7vbguok9d').
                    enableFeature(google.picker.Feature.MULTISELECT_ENABLED).
                    build();
            picker.setVisible(true);
        };
        // A simple callback implementation.
        $scope.uploaderCallback = function(data) {
            if (data.action == google.picker.Action.PICKED) {
                var params = {
                    'access': $scope.account.access,
                    'parent': $scope.account.entityKey
                };
                params.items = new Array();
                $.each(data.docs, function(index) {
                    var item = {'id': data.docs[index].id,
                        'title': data.docs[index].name,
                        'mimeType': data.docs[index].mimeType,
                        'embedLink': data.docs[index].url

                    };
                    params.items.push(item);
                });
               Attachement.attachfiles($scope, params);}
        }
        $scope.createLogoPickerUploader = function() {
            var developerKey = 'AIzaSyDHuaxvm9WSs0nu-FrZhZcmaKzhvLiSczY';
            var picker = new google.picker.PickerBuilder().
                addView(new google.picker.DocsUploadView()).
                setCallback($scope.logoUploaderCallback).
                setOAuthToken(window.authResult.access_token).
                setDeveloperKey(developerKey).
                setAppId('935370948155-qm0tjs62kagtik11jt10n9j7vbguok9d').
                build();
            picker.setVisible(true);
        };
        // A simple callback implementation.
        $scope.logoUploaderCallback = function(data) {
            if (data.action == google.picker.Action.PICKED) {
                if (data.docs) {
                    $scope.logo.logo_img_id = data.docs[0].id;
                    $scope.logo.logo_img_url = data.docs[0].url;
                    $scope.imageSrc = 'https://docs.google.com/uc?id=' + data.docs[0].id;
                    $scope.apply();
                    var params = {'id': $scope.account.id};
                    params['logo_img_id'] = $scope.logo.logo_img_id;
                    params['logo_img_url'] = $scope.logo.logo_img_url;
                    Account.patch($scope, params);
                }
            }
        }
      $scope.createPickerUploaderContact= function() {
            var projectfolder = $scope.account.folder;
            var developerKey = 'AIzaSyDHuaxvm9WSs0nu-FrZhZcmaKzhvLiSczY';
            var docsView = new google.picker.DocsView()
                    .setIncludeFolders(true)
                    .setSelectFolderEnabled(true);
            var picker = new google.picker.PickerBuilder().
                    addView(new google.picker.DocsUploadView().setParent(projectfolder)).
                    addView(docsView).
                    setCallback(function(data){
                      if (data.action == google.picker.Action.PICKED) {
                          if (data.docs) {
                              $scope.contact_img.id = data.docs[0].id;
                              $scope.contact_img.url = data.docs[0].url;
                              $scope.imageSrcContact='https://docs.google.com/uc?id=' + data.docs[0].id;
                              $scope.$apply();
                          }
                      }
                    }).
                    setOAuthToken(window.authResult.access_token).
                    setDeveloperKey(developerKey).
                    setAppId('935370948155-qm0tjs62kagtik11jt10n9j7vbguok9d').
                    enableFeature(google.picker.Feature.MULTISELECT_ENABLED).
                    build();
            picker.setVisible(true);
        };
        $scope.share = function(slected_memeber) {

        
                var body = {'access': $scope.account.access};
                var id = $scope.account.id;
                var params = {'id': id,
                    'access': $scope.account.access}
                Account.patch($scope, params);
                  // who is the parent of this event .hadji hicham 21-07-2014.

                params["parent"]="account";
                Event.permission($scope,params);
                Task.permission($scope,params);
        

            if ($scope.sharing_with.length > 0) {

                var items = [];

                angular.forEach($scope.sharing_with, function(user) {
                    var item = {
                        'type': "user",
                        'value': user.entityKey
                    };
                    items.push(item);
                });

                if (items.length > 0) {
                    var params = {
                        'about': $scope.account.entityKey,
                        'items': items
                    }
                    Permission.insert($scope, params);
                }


                $scope.sharing_with = [];


            }

        };
        $scope.showModal = function() {
            $('#addAccountModal').modal('show');
        };
        $scope.addNote = function(note) {
            var params = {
                'about': $scope.account.entityKey,
                'title': note.title,
                'content': note.content
            };
            Note.insert($scope, params);
            $scope.note.title = '';
            $scope.note.content = '';
        };
        $scope.editaccount = function() {
            $('#EditAccountModal').modal('show');
        };
        //HKA 22.11.2013 Edit tagline of Account
        $scope.edittagline = function() {
            $('#EditTagModal').modal('show');
        };
        //HKA Edit Introduction on Account
        $scope.editintro = function() {
            $('#EditIntroModal').modal('show');
        };
        //HKA 09.11.2013 Add a new Tasks
        $scope.addTask = function(task) {
                if ($scope.newTaskform==false) {
                      $scope.newTaskform=true;
               }else{
                if (task.title!=null) {
                        //  $('#myModal').modal('hide');
                if (task.due){
                    var dueDate= $filter('date')(task.due,['yyyy-MM-ddT00:00:00.000000']);
                    params ={'title': task.title,
                              'due': dueDate,
                              'parent': $scope.account.entityKey,
                              'access':$scope.account.access
                    }

                }else{
                    params ={'title': task.title,
                             'parent': $scope.account.entityKey,
                             'access':$scope.account.access
                           }
                };
                if ($scope.selected_members!=[]) {
                      params.assignees=$scope.selected_members;
                    };
                    var tags=[];
                    tags=$('#select2_sample2').select2("val");
                    if (tags!=[]) {
                      var tagitems = [];
                      angular.forEach(tags, function(tag){
                      var item = {'entityKey': tag };
                      tagitems.push(item);
                    });
                      params.tags=tagitems;
                    };

               Task.insert($scope,params);
                $scope.newTask={};
                $scope.newTaskform=false;
                $scope.selected_members=[];
            }else{
                $scope.newTask={};
                $scope.newTaskform=false;
          }
         }
        };

    //HKA 27.07.2014 Add button cancel on Task form
       $scope.closeTaskForm=function(newTask){
               $scope.newTask={};
                $scope.newTaskform=false;
    };

        $scope.hilightTask = function() {

            $('#task_0').effect("highlight", "slow");
            $('#task_0').effect("bounce", "slow");

        };
      $scope.lunchNew=function(){
            console.log('wwwwwwwwwwwwork');
            $('#testnonefade').modal("show");
            $(".modal-backdrop").remove();
        }
        $scope.listTasks = function() {
            var params = {
                'id': $scope.account.id,
                'events': {},
                'tasks': {}
            };
            Account.get($scope, params);
        };
//HKA 11.11.2013 Add new Event
 $scope.addEvent = function(ioevent){
            /*****************************/

             if ($scope.newEventform==false) {
                $scope.newEventform=true;
           }else{


            if (ioevent.title!=null&&ioevent.title!="") {

                    var params ={}


                  // hadji hicham 13-08-2014.
                  if($scope.allday){
                         var ends_at=moment(moment(ioevent.starts_at_allday).format('YYYY-MM-DDT00:00:00.000000'))

                   params ={'title': ioevent.title,
                            'starts_at': $filter('date')(ioevent.starts_at_allday,['yyyy-MM-ddT00:00:00.000000']),
                            'ends_at':ends_at.add('hours',23).add('minute',59).add('second',59).format('YYYY-MM-DDTHH:mm:00.000000'),
                            'where': ioevent.where,
                            'parent':$scope.account.entityKey,
                            'access':$scope.account.access,
                            'allday':"true"
                      }



                  }else{

                  if (ioevent.starts_at){
                    if (ioevent.ends_at){
                      params ={'title': ioevent.title,
                              'starts_at': $filter('date')(ioevent.starts_at,['yyyy-MM-ddTHH:mm:00.000000']),
                              'ends_at': $filter('date')(ioevent.ends_at,['yyyy-MM-ddTHH:mm:00.000000']),
                              'where': ioevent.where,
                              'parent':$scope.account.entityKey,
                              'access':$scope.account.access,
                              'allday':"false"
                      }

                    }else{
                      params ={
                        'title': ioevent.title,
                              'starts_at': $filter('date')(ioevent.starts_at,['yyyy-MM-ddTHH:mm:00.000000']),
                              'where': ioevent.where,
                              'parent':$scope.account.entityKey,
                              'ends_at':moment(ioevent.ends_at).add('hours',2).format('YYYY-MM-DDTHH:mm:00.000000'),
                              'access':$scope.account.access,
                              'allday':"false"
                      }
                    }

                  }
                  }

                   Event.insert($scope,params);
                  $scope.ioevent={};
                  $scope.newEventform=false;
        }
     }
    }
// hadji hicham 14-07-2014 . update the event after we add .
$scope.updateEventRenderAfterAdd= function(){};

       $scope.deleteEvent =function(eventt){
    var params = {'entityKey':eventt.entityKey};
     Event.delete($scope,params);
     //$('#addLeadModal').modal('show');
   }
      $scope.eventDeleted = function(resp){
   };
        $scope.closeEventForm=function(ioevent){
      $scope.ioevent={};
      $scope.newEventform=false;
    }
        $scope.hilightEvent = function() {

            $('#event_0').effect("highlight", "slow");
            $('#event_0').effect("bounce", "slow");

        };
        $scope.listEvents = function() {
            var params = {
                'id': $scope.account.id,
                'events': {
                }
            };
            Account.get($scope, params);

        };

        //HKA 18.11.2013 Show modal Related list (Contact)

        $scope.addContactModal = function() {
            $('#addContactModal').modal('show');
        };

        // HKA 18.11.2013 Show modal Related list (Opportunity)
        $scope.addOppModal = function() {
            $('#addOpportunityModal').modal('show');
        };

        //HKA 18.11.2013 Show modal Related list (Case)
        $scope.addCaseModal = function() {
            $('#addCaseModal').modal('show');
        };
        $scope.addNeedModal = function() {
            $('#addNeedModal').modal('show');
        };

        //HKA 22.11.2013 List of Contacts related to account
        $scope.listContacts = function() {
            var params = {
                'id': $scope.account.id,
                'contacts': {
                    'limit': '6'
                }
            };
            Account.get($scope, params);
        };

        //HKA 22.11.2013 List of Opportunities related to account
        $scope.listOpportunities = function() {
            var params = {
                'id': $scope.account.id,
                'opportunities': {
                    'limit': '6'
                }
            };
            Account.get($scope, params);
        };

        //HKA 22.11.2013 List of Cases related to account
        $scope.listCases = function() {

            var params = {
                'id': $scope.account.id,
                'cases': {
                    'limit': '6'
                }
            };
            Account.get($scope, params);

        };
        $scope.listNeeds = function() {

            var params = {
                'id': $scope.account.id,
                'needs': {
                    'limit': '6'
                }
            };
            Account.get($scope, params);

        };

  
        // HKA 19.11.2013 Add Opportunty related to account
 $scope.opportunityInserted = function(resp){
          window.location.replace('#/accounts');
      };
        // HKA 19.11.2013 Add Case related to account

        $scope.saveNeed = function(need) {


            var params = {'name': need.name,
                'description': need.description,
                'priority': need.priority,
                'need_status': need.need_status,
                'folder': $scope.account.folder,
                'parent': $scope.account.entityKey,
                'access': $scope.account.access
            };

            Need.insert($scope, params);
            $('#addNeedModal').modal('hide');

        };
        $scope.listInfonodes = function(kind) {
            params = {'parent': $scope.account.entityKey,
                'connections': kind
            };
            InfoNode.list($scope, params);
            


        }
//HKA 19.11.2013 Add Phone
        $scope.addPhone = function(phone) {
            console.log(phone)
            if (phone.number) {
                params = {'parent': $scope.account.entityKey,
                    'kind': 'phones',
                    'fields': [
                        {
                            "field": "type",
                            "value": phone.type
                        },
                        {
                            "field": "number",
                            "value": phone.number
                        }
                    ]
                };
                InfoNode.insert($scope, params);
            }
            $scope.phone = {};
            $scope.phone.type = 'work';
            $scope.phone.number = '';

            $scope.showPhoneForm = false;


        };

        $scope.patchPhoneNumber = function(entityKey, data) {


            params = {
                'entityKey': entityKey,
                'parent': $scope.account.entityKey,
                'kind': 'phones',
                'fields': [
                    {
                        "field": "number",
                        "value": data
                    }
                ]
            };
            InfoNode.patch($scope, params);
        };


//HKA 20.11.2013 Add Email
        $scope.addEmail = function(email) {
            if (email.email) {
                params = {'parent': $scope.account.entityKey,
                    'kind': 'emails',
                    'fields': [
                        {
                            "field": "email",
                            "value": email.email
                        }
                    ]
                };
                InfoNode.insert($scope, params);
            }
            $scope.email = {};
            $scope.showEmailForm = false;
        };


        $scope.prepareUrl=function(url){
                    var pattern=/^[a-zA-Z]+:\/\//;
                     if(!pattern.test(url)){                        
                         url = 'http://' + url;
                     }
                     return url;
        }
        $scope.urlSource=function(url){
            var links=["apple","bitbucket","dribbble","dropbox","facebook","flickr","foursquare","github","instagram","linkedin","pinterest","trello","tumblr","twitter","youtube"];
                    var match="";
                    angular.forEach(links, function(link){
                         var matcher = new RegExp(link);
                         var test = matcher.test(url);
                         if(test){  
                             match=link;
                         }
                    });
                    if (match=="") {
                        match='globe';
                    };
                    return match;
        }
//HKA 22.11.2013 Add Website
        $scope.addWebsite = function(website) {
                     
            if (website.url!=""&&website.url!=undefined) {
                params = {'parent': $scope.account.entityKey,
                'kind': 'websites',
                'fields': [
                    {
                        "field": "url",
                        "value": website.url
                    }
                ]
            };
            InfoNode.insert($scope, params);
            $scope.website = {};
            $scope.showWebsiteForm = false;

            };            
        };

//HKA 22.11.2013 Add Social
        $scope.addSocial = function(social) {
             if (social.url!=""&&social.url!=undefined) {
            params = {'parent': $scope.account.entityKey,
                'kind': 'sociallinks',
                'fields': [
                    {
                        "field": "url",
                        "value": social.url
                    }
                ]
            };
            InfoNode.insert($scope, params);
            $scope.sociallink = {};
            $scope.showSociallinkForm = false;
            };  
        };
        $scope.addCustomField = function(customField) {
            if (customField.field && customField.value) {
                params = {'parent': $scope.account.entityKey,
                    'kind': 'customfields',
                    'fields': [
                        {
                            "field": customField.field,
                            "value": customField.value
                        }
                    ]
                };
                InfoNode.insert($scope, params);
            }

            $scope.customfield = {};
            $scope.customfield.field = '';
            $scope.customfield.value = '';
            $scope.showCustomFieldForm = false;

        };
//HKA 22.11.2013 Add Tagline
        $scope.updateTagline = function(account) {

            var params = {
                'id': account.id,
                'tagline': account.tagline
            }
            console.log(params);
            Account.patch($scope, params);
        };

//HKA 22.11.2013 Add Introduction
        $scope.updateintro = function(account) {

            var params = {
                'id':account.id,
                'introduction': account.introduction
                }
            Account.patch($scope, params);
        };
//HKA 22.11.2013 Add Account

        $scope.updatAccountHeader = function(account){

          params = {'id':$scope.account.id,
                     'name':account.name,
                   'account_type':account.account_type,
                   'industry':account.industry}
          Account.patch($scope,params);
          $('#EditAccountModal').modal('hide');
        };
    // arezki lebdiri 03/07/2014 send email
/*$scope.sendEmailSelected=function(){
  $scope.email.to = '';
  angular.forEach($scope.infonodes.emails, function(value, key){
    console.log(value)
    if (value.email) $scope.email.to = $scope.email.to + value.email + ',';
    });

};
      $scope.sendEmail = function(email){
        email.body = $('#some-textarea').val();
        var params = {
                  'to': email.to,
                  'cc': email.cc,
                  'bcc': email.bcc,
                  'subject': email.subject,
                  'body': email.body,
                  'about':$scope.account.entityKey
                  };

        Email.send($scope,params);
      };*/
        $scope.beforedeleteInfonde = function(){
            $('#BeforedeleteInfonode').modal('show');
        }
        $scope.deleteaccount = function(){
             var accountKey = {'entityKey':$scope.account.entityKey};
             Account.delete($scope,accountKey);
             $('#BeforedeleteAccount').modal('hide');
        };
        $scope.renderMaps = function(){
        /*console.log('in renderMaps');
        */
        console.log("enter to account controller");
        $scope.addresses = $scope.account.addresses;
        Map.renderwith($scope);
        };
        $scope.addAddress = function(address){

        Map.searchLocation($scope,address);

        $('#addressmodal').modal('hide');
        $scope.address={};
        };
      $scope.locationUpdated = function(addressArray){

          var params = {'id':$scope.account.id,
                         'addresses':addressArray};

          Account.patch($scope,params);
      };
       $scope.addGeo = function(address){
          params = {'parent':$scope.account.entityKey,
            'kind':'addresses',
            'fields':[
                {
                  "field": "street",
                  "value": address.street
                },
                {
                  "field": "city",
                  "value": address.city
                },
                {
                  "field": "state",
                  "value": address.state
                },
                {
                  "field": "postal_code",
                  "value": address.postal_code
                },
                {
                  "field": "country",
                  "value": address.country
                }
            ]
          };
          if (address.lat){
            params = {'parent':$scope.account.entityKey,
            'kind':'addresses',
            'fields':[
                {
                  "field": "street",
                  "value": address.street
                },
                {
                  "field": "city",
                  "value": address.city
                },
                {
                  "field": "state",
                  "value": address.state
                },
                {
                  "field": "postal_code",
                  "value": address.postal_code
                },
                {
                  "field": "country",
                  "value": address.country
                },
                {
                  "field": "lat",
                  "value": address.lat.toString()
                },
                {
                  "field": "lon",
                  "value": address.lon.toString()
                }
              ]
            };
          }
          InfoNode.insert($scope,params);
      };

        $scope.updatAccountHeader = function(account) {

            params = {'id': $scope.account.id,
                'owner':$scope.ownerSelected.google_user_id,
                'name': account.name,
                'account_type': account.account_type,
                'industry': account.industry}
            Account.patch($scope, params);
            $('#EditAccountModal').modal('hide');
        };
        // arezki lebdiri 03/07/2014 send email
        $scope.sendEmailSelected = function() {
            $scope.email.to = '';
            angular.forEach($scope.infonodes.emails, function(value, key) {
                console.log(value)
                if (value.email)
                    $scope.email.to = $scope.email.to + value.email + ',';
            });

        };
        $scope.showAttachFilesPicker = function() {
          var developerKey = 'AIzaSyDHuaxvm9WSs0nu-FrZhZcmaKzhvLiSczY';
          var docsView = new google.picker.DocsView()
              .setIncludeFolders(true)
              .setSelectFolderEnabled(true);
          var picker = new google.picker.PickerBuilder().
              addView(new google.picker.DocsUploadView()).
              addView(docsView).
              setCallback($scope.attachmentUploaderCallback).
              setOAuthToken(window.authResult.access_token).
              setDeveloperKey(developerKey).
              setAppId('935370948155-qm0tjs62kagtik11jt10n9j7vbguok9d').
                enableFeature(google.picker.Feature.MULTISELECT_ENABLED).
              build();
          picker.setVisible(true);
      };
      $scope.attachmentUploaderCallback= function(data){
        if (data.action == google.picker.Action.PICKED) {
                $.each(data.docs, function(index) {
                    var file = { 'id':data.docs[index].id,
                                  'title':data.docs[index].name,
                                  'mimeType': data.docs[index].mimeType,
                                  'embedLink': data.docs[index].url
                    };
                    $scope.sendWithAttachments.push(file);
                });
                $scope.apply();
        }
      }

      $scope.sendEmail = function(email){
        KeenIO.log('send email');
        email.body = $('#some-textarea').val();
        var params = {
                  'to': email.to,
                  'cc': email.cc,
                  'bcc': email.bcc,
                  'subject': email.subject,
                  'body': email.body,
                  'about':$scope.account.entityKey
                  };
        if ($scope.sendWithAttachments){
            params['files']={
                            'parent':$scope.account.entityKey,
                            'access':$scope.account.access,
                            'items':$scope.sendWithAttachments
                            };
        };
        
        Email.send($scope,params);       
      };
        $scope.emailSent=function(){
            console.log('$scope.email');
            console.log($scope.email);
            $scope.email={};
            $scope.showCC=false;
            $scope.showBCC=false;
            $('#testnonefade').modal("hide");
             $scope.email={};
             console.log('$scope.email');
        }
        $scope.emailSentConfirmation=function(){
            console.log('$scope.email');
            console.log($scope.email);
            $scope.email={};
            $scope.showCC=false;
            $scope.showBCC=false;
            $('#testnonefade').modal("hide");
             $scope.emailSentMessage=true;
             setTimeout(function(){  $scope.emailSentMessage=false; $scope.apply() }, 2000);
        }
        $scope.beforedeleteInfonde = function() {
            $('#BeforedeleteInfonode').modal('show');
        }
        $scope.deleteaccount = function() {
            var accountKey = {'entityKey': $scope.account.entityKey};
            Account.delete($scope, accountKey);

            $('#BeforedeleteAccount').modal('hide');
        };
        
        $scope.addAddress = function(address) {

            Map.searchLocation($scope, address);

            $('#addressmodal').modal('hide');
            $scope.address = {};
        };
        $scope.locationUpdated = function(addressArray) {

            var params = {'id': $scope.account.id,
                'addresses': addressArray};

            Account.patch($scope, params);
        };
        $scope.addGeo = function(address) {
            params = {'parent': $scope.account.entityKey,
                'kind': 'addresses',
                'fields': [
                    {
                        "field": "street",
                        "value": address.street
                    },
                    {
                        "field": "city",
                        "value": address.city
                    },
                    {
                        "field": "state",
                        "value": address.state
                    },
                    {
                        "field": "postal_code",
                        "value": address.postal_code
                    },
                    {
                        "field": "country",
                        "value": address.country
                    }
                ]
            };
            if (address.lat) {
                params = {'parent': $scope.account.entityKey,
                    'kind': 'addresses',
                    'fields': [
                        {
                            "field": "street",
                            "value": address.street
                        },
                        {
                            "field": "city",
                            "value": address.city
                        },
                        {
                            "field": "state",
                            "value": address.state
                        },
                        {
                            "field": "postal_code",
                            "value": address.postal_code
                        },
                        {
                            "field": "country",
                            "value": address.country
                        },
                        {
                            "field": "lat",
                            "value": address.lat.toString()
                        },
                        {
                            "field": "lon",
                            "value": address.lng.toString()
                        }
                    ]
                };
            }
            InfoNode.insert($scope, params);
        };
        //HKA 08.01.2014
        $scope.About_render = function(accid) {

            var acc = Account.get($scope, accountid);

            $scope.addresses = acc.addresses;
            Map.render($scope);
        };

        $scope.idealTextColor = function(bgColor) {
            var nThreshold = 105;
            var components = getRGBComponents(bgColor);
            var bgDelta = (components.R * 0.299) + (components.G * 0.587) + (components.B * 0.114);

            return ((255 - bgDelta) < nThreshold) ? "#000000" : "#ffffff";
        };
        function getRGBComponents(color) {

            var r = color.substring(1, 3);
            var g = color.substring(3, 5);
            var b = color.substring(5, 7);

            return {
                R: parseInt(r, 16),
                G: parseInt(g, 16),
                B: parseInt(b, 16)

            };
        }

        $scope.getTopicUrl = function(type, id) {
            return Topic.getUrl(type, id);
        };
        $scope.setLocation=function(address){
            console.log("wooooork");
            Map.setLocation($scope,address);
        }
//HKA 12.03.2014 Edit infonode
        $scope.edit_email = function(email) {

            $scope.edited_email = email;
        };

        $scope.editTag = function(tag) {
            $scope.edited_tag = tag;
        }
        $scope.doneEditTag = function(tag) {
            $scope.edited_tag = null;
            $scope.updateTag(tag);
        };

        $scope.initObject = function(obj) {
            for (var key in obj) {
                obj[key] = null;
            }
        }

        $scope.pushElement = function(elem, arr) {
            console.log(elem);
            console.log(arr)
            if (arr.indexOf(elem) == -1) {
                var copyOfElement = angular.copy(elem);
                arr.push(copyOfElement);
                $scope.initObject(elem);

            } else {
                alert("item already exit");
            }
        }

        $scope.listMoreOnScroll = function() {
            switch ($scope.selectedTab)
            {
                case 3:
                    $scope.ContactlistNextPageItems();
                    break;
                case 5:
                    $scope.OpplistNextPageItems();
                    break;
                case 6:
                    $scope.CaselistNextPageItems();
                    break;
                case 7:
                    $scope.DocumentlistNextPageItems();
                    break;
                case 1:
                    $scope.TopiclistNextPageItems();
                    break;


            }
        };
        // LBA le 21-10-2014
        $scope.DeleteCollaborator=function(entityKey){
            console.log("delete collaborators")
            var item = {
                          'type':"user",
                          'value':entityKey,
                          'about':$scope.account.entityKey
                        };
            Permission.delete($scope,item)
            console.log(item)
        };
        // Google+ Authentication
        Auth.init($scope);
        $(window).scroll(function() {
            if (!$scope.isLoading && ($(window).scrollTop() > $(document).height() - $(window).height() - 100)) {
                $scope.listMoreOnScroll();
            }
        });

    }]);


app.controller('AccountNewCtrl', ['$scope', 'Auth', 'Account', 'Tag', 'Edge','Map',
    function($scope, Auth, Account, Tag, Edge, Map) {
        $("ul.page-sidebar-menu li").removeClass("active");
        $("#id_Accounts").addClass("active");

        document.title = "Accounts: New";
        $scope.isSignedIn = false;
        $scope.immediateFailed = false;
        $scope.nextPageToken = undefined;
        $scope.prevPageToken = undefined;
        $scope.isLoading = false;
        $scope.nbLoads=0;
        $scope.leadpagination = {};
        $scope.currentPage = 01;
        $scope.pages = [];
        $scope.stage_selected = {};
        $scope.accounts = [];
        $scope.account = {};
        $scope.account.addresses = [];
        $scope.account.access = 'public';
        $scope.order = '-updated_at';
        $scope.status = 'New';
        $scope.showPhoneForm = false;
        $scope.showEmailForm = false;
        $scope.showWebsiteForm = false;
        $scope.showSociallinkForm = false;
        $scope.showCustomFieldForm = false;
        $scope.phones = [];
        $scope.addresses = [];
        $scope.infonodes=[];
        $scope.infonodes.addresses=[];
        $scope.emails = [];
        $scope.websites = [];
        $scope.existingcontacts=[];
        $scope.sociallinks = [];
        $scope.customfields = [];
        $scope.newContactform = false;
        $scope.account.account_type = 'Customer';
        $scope.account.industry = 'Technology';
        $scope.phone = {};
        $scope.contact = {};
        $scope.currentContact = {};
        $scope.account.contacts = [];
        $scope.phone.type = 'work';
        $scope.newRelatedContact =false; 
        $scope.logo = {
            'logo_img_id': null,
            'logo_img_url': null
        };
        $scope.imageSrc = '/static/img/default_company.png';
        $scope.inProcess=function(varBool,message){
          if (varBool) {           
            if (message) {
              console.log("starts of :"+message);
            };
            $scope.nbLoads=$scope.nbLoads+1;
            if ($scope.nbLoads==1) {
              $scope.isLoading=true;
            };
          }else{
            if (message) {
              console.log("ends of :"+message);
            };
            $scope.nbLoads=$scope.nbLoads-1;
            if ($scope.nbLoads==0) {
               $scope.isLoading=false;
 
            };

          };
        }        
        $scope.apply=function(){
         
          if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
               $scope.$apply();
              }
              return false;
        }
        $scope.initObject = function(obj) {
            for (var key in obj) {
                obj[key] = null;
            }
        }
        $scope.test=function(){
            console.log("wooooork");
        }
        $scope.testaction=function(act){
            console.log(act);
        }
        $scope.pushElement = function(elem, arr, infos) {
            console.log(elem)
            console.log(arr)
            console.log(infos)
            if (arr.indexOf(elem) == -1) {
                // var copyOfElement = angular.copy(elem);
                // arr.push(copyOfElement);
                // $scope.initObject(elem);

                switch (infos) {
                    case 'phones' :
                        if (elem.number) {
                            var copyOfElement = angular.copy(elem);
                            arr.push(copyOfElement);
                            $scope.initObject(elem);
                        }
                        $scope.showPhoneForm = false;
                        $scope.phone.type = 'work';
                        $scope.phone.number = '';
                        break;
                    case 'emails' :
                        if (elem.email) {
                            var copyOfElement = angular.copy(elem);
                            arr.push(copyOfElement);
                            $scope.initObject(elem);
                        }
                        $scope.showEmailForm = false;
                        $scope.email.email = ''
                        break;
                    case 'websites' :
                        if (typeof elem !== 'undefined') {
                            if (elem.url!="" && elem!=null) {
                            var copyOfElement = angular.copy(elem);
                            arr.push(copyOfElement);
                            $scope.initObject(elem);
                        }
                        };
                        
                        $scope.website.url = '';
                        $scope.showWebsiteForm = false;
                        break;
                    case 'sociallinks' :
                        if (typeof elem !== 'undefined') {
                            if (elem.url!="" && elem!=null) {
                                var copyOfElement = angular.copy(elem);
                                arr.push(copyOfElement);
                                $scope.initObject(elem);
                            }
                        }
                        $scope.sociallink.url = '';
                        $scope.showSociallinkForm = false;
                        break;
                    case 'customfields' :
                        if (elem.field && elem.value) {
                            var copyOfElement = angular.copy(elem);
                            arr.push(copyOfElement);
                            $scope.initObject(elem);
                        }
                        $scope.customfield.field = '';
                        $scope.customfield.value = '';
                        $scope.showCustomFieldForm = false;
                        break;
                    case 'addresses' :
                        if (elem.country) {
                            var copyOfElement = angular.copy(elem);
                            arr.push(copyOfElement);
                            $scope.initObject(elem);
                        }

                        $('#addressmodal').modal('hide');

                        break;
                }
            } else {
                alert("item already exit");
            }
        };
        //HKA 01.06.2014 Delete the infonode on DOM
        $scope.deleteInfos = function(arr, index) {
            console.log("work");
            arr.splice(index, 1);
        }
        $scope.runTheProcess = function() {
            /*Account.list($scope,{});*/
            $scope.mapAutocomplete();
            Map.justAutocomplete ($scope,"relatedContactAddress",$scope.currentContact.address);
            ga('send', 'pageview', '/accounts/new');
            window.Intercom('update');

        };

        $scope.mapAutocomplete=function(){
            $scope.addresses = $scope.account.addresses;
            Map.autocomplete ($scope,"pac-input");
        }
        
        $scope.addGeo = function(address){
               $scope.infonodes.addresses.push(address);
               $scope.addresses.push(address);
               $scope.apply();
               console.log($scope.infonodes.addresses);
            };
        $scope.setLocation=function(address){
            Map.setLocation($scope,address);
        }
        $scope.notFoundAddress=function(address,inputId){
            console.log(address.name);
            $scope.addressNotFound=address.name;
            $('#confirmNoGeoAddress').modal('show');
            $scope.apply(); 
            console.log("inputId");
            console.log(inputId);

            $('#'+inputId).val("");           
        }
        $scope.confirmaddress=function(){
             $scope.account.addresses.push({'formatted':$scope.addressNotFound});
             $scope.addressNotFound='';
             $('#confirmNoGeoAddress').modal('hide');
             $scope.apply();

        }
        // We need to call this to refresh token when user credentials are invalid
        $scope.refreshToken = function() {
            Auth.refreshToken();
        };
        // new Lead
        $scope.save = function(account) {
            if (account.name) {
                console.log(account);
                Account.insert($scope, account);
            };
        };
         var params_search_contact ={};
          $scope.$watch('searchContactQuery', function() {
            if($scope.searchContactQuery){
                if($scope.searchContactQuery.length>1){
                  params_search_contact['q'] = $scope.searchContactQuery;
                  gapi.client.crmengine.contacts.search(params_search_contact).execute(function(resp) {
                    if (resp.items){
                    $scope.contactsResults = resp.items;
                    $scope.apply();
                  };
                });
              }
            }
          });
          $scope.prepareUrl=function(url){
                    var pattern=/^[a-zA-Z]+:\/\//;
                     if(!pattern.test(url)){                        
                         url = 'http://' + url;
                     }
                     return url;
        }
        $scope.selectContact = function(){
            console.log('selectContact');
            $scope.existcontact = {
                        'firstname': $scope.searchContactQuery.firstname,
                        'lastname':  $scope.searchContactQuery.lastname,
                        'entityKey': $scope.searchContactQuery.entityKey
            }
            console.log($scope.existcontact);
            $scope.existingcontacts.push($scope.existcontact);
            $scope.apply();

        };
        $scope.changeRelatedForm =function(){
        /* if ($scope.newRelatedContact==false) {
            $scope.newRelatedContact=true;
         } else{
            $scope.newRelatedContact=false;
         };*/   
        }
        $scope.addContact = function(current) {

            if ($scope.newContactform == false) {
                $scope.newContactform = true;
            } else {
                if (current.firstname != null && current.lastname != null) {
                    $scope.contact = {
                        'firstname': current.firstname,
                        'lastname': current.lastname,
                        'access': $scope.account.acces
                    }
                    if (current.title != null) {
                        $scope.contact.title = current.title;
                    }
                    ;
                    if (current.phone != null) {
                        $scope.contact.phone = [{'number': current.phone, 'type': 'work'}];
                    }
                    if (current.emails != null) {
                        $scope.contact.emails = [{'email': current.email}];
                    }
                    if (current.address != null) {
                        $scope.contact.addresses = [{'address': current.address}];
                        console.log('current.address');
                        console.log(current.address);
                    }
                    ;
                    $scope.account.contacts.push($scope.contact);
                    console.log($scope.account.contacts);
                    $scope.currentContact = {};
                } else {
                    $scope.currentContact = {};
                   /* $scope.newContactform = false;*/
                }
                ;

            }
        }


        $scope.unselectContact = function(index) {
            $scope.account.contacts.splice(index, 1);
        }
        $scope.prepareInfonodes = function() {
            var infonodes = [];
            angular.forEach($scope.websites, function(website) {
                var infonode = {
                    'kind': 'websites',
                    'fields': [
                        {
                            'field': "url",
                            'value': website.url
                        }
                    ]

                }
                infonodes.push(infonode);
            });
            angular.forEach($scope.sociallinks, function(sociallink) {
                var infonode = {
                    'kind': 'sociallinks',
                    'fields': [
                        {
                            'field': "url",
                            'value': sociallink.url
                        }
                    ]

                }
                infonodes.push(infonode);
            });
            angular.forEach($scope.customfields, function(customfield) {
                var infonode = {
                    'kind': 'customfields',
                    'fields': [
                        {
                            'field': customfield.field,
                            'value': customfield.value
                        }
                    ]

                }
                infonodes.push(infonode);
            });
            angular.forEach($scope.infonodes.addresses, function(address){
               var infonode ={
              'kind':'addresses',
              'fields':[
                  {
                    "field": "street",
                    "value": address.street
                  },
                  {
                    "field": "city",
                    "value": address.city
                  },
                  {
                    "field": "state",
                    "value": address.state
                  },
                  {
                    "field": "postal_code",
                    "value": address.postal_code
                  },
                  {
                    "field": "country",
                    "value": address.country
                  }
                ]
              };
              if (address.lat&&address.lng) {
                infonode.fields.push({"field": "lat","value": address.lat.toString()});
                infonode.fields.push({"field": "lng","value": address.lng.toString()});
              };
              infonodes.push(infonode);
          });
            return infonodes;
        };
        $scope.createPickerUploader = function() {
            var developerKey = 'AIzaSyDHuaxvm9WSs0nu-FrZhZcmaKzhvLiSczY';
            var picker = new google.picker.PickerBuilder().
                    addView(new google.picker.DocsUploadView()).
                    setCallback($scope.uploaderCallback).
                    setOAuthToken(window.authResult.access_token).
                    setDeveloperKey(developerKey).
                    setAppId('935370948155-qm0tjs62kagtik11jt10n9j7vbguok9d').
                    build();
            picker.setVisible(true);
        };

        $scope.uploaderCallback = function(data) {
            if (data.action == google.picker.Action.PICKED) {
                if (data.docs) {
                    $scope.logo.logo_img_id = data.docs[0].id;
                    $scope.logo.logo_img_url = data.docs[0].url;
                    $scope.imageSrc = 'https://docs.google.com/uc?id=' + data.docs[0].id;
                    $scope.apply();
                }
            }
        }

        $scope.accountInserted = function(resp) {
            window.location.replace('/#/accounts');
        };
        $scope.save = function(account) {
            if (account.name) {
                var params = {
                    'name': account.name,
                    'account_type': account.account_type,
                    'industry': account.industry,
                    'tagline': account.tagline,
                    'introduction': account.introduction,
                    'phones': $scope.phones,
                    'emails': $scope.emails,
                    'infonodes': $scope.prepareInfonodes(),
                    'access': account.access,
                    'contacts': account.contacts,
                    'existing_contacts':$scope.existingcontacts
                };

                if ($scope.logo.logo_img_id) {
                    params['logo_img_id'] = $scope.logo.logo_img_id;
                    params['logo_img_url'] = $scope.logo.logo_img_url;
                }
                Account.insert($scope, params);

            }
        };



        $scope.addAccountOnKey = function(account) {
            if (event.keyCode == 13 && account) {
                $scope.save(account);
            }
        };



        // Google+ Authentication
        Auth.init($scope);


    }]);
