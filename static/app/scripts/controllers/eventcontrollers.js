app.controller('EventShowController',['$scope','$filter','$route','Auth','Note','Event','Task','Topic','Comment','User','Contributor',
   function($scope,$filter,$route,Auth,Note,Event,Task,Topic,Comment,User,Contributor) {
//HKA 14.11.2013 Controller to show Events and add comments
   $scope.isSignedIn = false;
     $scope.immediateFailed = false;
     $scope.nextPageToken = undefined;
     $scope.prevPageToken = undefined;
     $scope.isLoading = false;
     $scope.pagination = {};
     $scope.currentPage = 01;
     $scope.pages = [];
     
     $scope.notes = [];
     $scope.users = [];
     $scope.user = undefined;
     $scope.slected_memeber = undefined;
     $scope.role= 'participant';  
     // What to do after authentication
     $scope.runTheProcess = function(){
          var eventid = {'id':$route.current.params.eventId};
          Event.get($scope,eventid);
          User.list($scope,{});
     };
     // We need to call this to refresh token when user credentials are invalid
     $scope.refreshToken = function() {
            Auth.refreshToken();
     };
     $scope.listNextPageItems= function(){
        
        
        var nextPage = $scope.currentPage + 1;
        console.log('hahahahahahahah');
        console.log(nextPage);
        console.log($scope.pages[nextPage])
        var params = {};
          if ($scope.pages[nextPage]){
            params = {'limit':5,
                      //'discussion':$scope.note.entityKey,
                      'pageToken':$scope.pages[nextPage]

                     }
          }else{
            params = {'limit':5}
          }
          console.log('in listNextPageItems');
          $scope.currentPage = $scope.currentPage + 1 ; 
          Comment.list($scope,params);
     }
     $scope.listPrevPageItems = function(){
       
       var prevPage = $scope.currentPage - 1;
       var params = {};
          if ($scope.pages[prevPage]){
            params = {'limit':5,
                      //'discussion':$scope.note.entityKey,
                      'pageToken':$scope.pages[prevPage]
                     }
          }else{
            params = {'limit':5}
          }
          $scope.currentPage = $scope.currentPage - 1 ;
          Comment.list($scope,params);
     }
   
    

     
     $scope.showModal = function(){
        console.log('button clicked');
        $('#addAccountModal').modal('show');

      };

    $scope.addComment = function(comment){

      var params ={
        //'discussion':$scope.note.entityKey,
        'content':$scope.comment.content
      };
      Comment.insert($scope,params);
      $scope.comment.content='';
     
      
    };
    $scope.ListComments = function(){

      var params = {
                        //'discussion':$scope.note.entityKey,
                     'limit':5,
                      'order':'-updated_at'};
      Comment.list($scope,params);
      
      
    };
//HKA 18.11.2013 highlight the comment
   $scope.hilightComment = function(){
        console.log('Should higll');
       $('#comment_0').effect( "bounce", "slow" );
       $('#comment_0 .message').effect("highlight","slow");
     };

 //HKA 02.12.2013 Add Contributor

    $scope.addNewContributor = function(selected_user,role){
      console.log('*************** selected user ***********************');
      console.log(selected_user);
      
      var params = {   
                      'discussionKey': $scope.eventt.entityKey,

                      'type': 'user',
                      'value': selected_user.email,
                      'name': selected_user.google_display_name,
                      'photoLink': selected_user.google_public_profile_photo_url,
                      'role': role


                      // Create Contributor Service
                      // Create contributors.list api
                      //list all contributors after getting the task.
                     
                      
        }  
        console.log('selected member');
        console.log(params); 
        Contributor.insert($scope,params);
     $('#addContributor').modal('hide');
     };
//HKA 02.12.2013 Select member
$scope.selectMember = function(){
        
        $scope.slected_memeber = $scope.user;
        $scope.user = $scope.slected_memeber.google_display_name;

     };
//HKA 02.12.2013 List contributors
$scope.listContributors = function(){
      var params = {'discussionKey':$scope.eventt.entityKey,
                     'order':'-created_at'};
      Contributor.list($scope,params);
      };

  // Google+ Authentication 
  Auth.init($scope);
}]);
