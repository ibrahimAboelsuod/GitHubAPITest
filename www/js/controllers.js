angular.module('AFITTask.controllers').controller("homeCtrl",
  ['$scope', '$webServicesFactory', '$globalFactory','$state', '$window',
    function ($scope, $webServicesFactory, $globalFactory, $state, $window) {
      $scope.isAllReposLoaded = false;
      $scope.reposPageLimit = 10; //repos per page
      $scope.reposPage = 1; //last requested page
      $scope.repos = [];
      $scope.offLineRepos = {};
      $scope.isReposSavedOffline = false;


      //get offline list
      $scope.$on("$ionicView.afterEnter", function (event, data) {
        $scope.offLineRepos = (JSON.parse(window.localStorage.getItem("offlineRepo")))? JSON.parse(window.localStorage.getItem("offlineRepo")):{};
        console.log($scope.offLineRepos);
        $scope.isReposSavedOffline = (Object.keys($scope.offLineRepos).length >0);

        //if it's saved offline then remove it from online list
        for(var repoI=0; repoI<$scope.repos.length; repoI ++){
          if($scope.offLineRepos[$scope.repos[repoI].name]){
            $scope.repos.splice(repoI, 1);
            repoI -= 1;
          }

        }
      });


      //pagination
      $scope.loadMoreRepos = function () {
        $webServicesFactory.get(
          "https://api.github.com/users/blackberry/repos",
          {},
          {
            page: $scope.reposPage,
            per_page: $scope.reposPageLimit
          }
        ).then(
          function (response) {
            if(response.length == 0)
              $scope.isAllReposLoaded = true;
            else
              $scope.repos = $scope.repos.concat(response);

            //if it's saved offline then update it and remove it from online list
            for(var repoI=0; repoI<$scope.repos.length; repoI ++){
              if($scope.offLineRepos[$scope.repos[repoI].name]){
                $scope.offLineRepos[$scope.repos[repoI].name] = $scope.repos[repoI];
                $scope.repos.splice(repoI, 1);
                repoI -= 1;

                window.localStorage.setItem("offlineRepo", JSON.stringify($scope.offLineRepos));
              }

            }
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.reposPage += 1;
          }
        );

      };

      $scope.openDetail = function (repo) {
        $globalFactory.repo = repo;
        $state.go("app.detail");
      };

      //refreshes the app to reload everything
      $scope.refreshRepos = function () {
        $window.location.reload().then(
          function success(){
            $location.path('/home');
          },
          function error(error) {}
        );
      };
    }
]);

angular.module('AFITTask.controllers').controller("detailCtrl",
  ['$scope', '$globalFactory',
    function ($scope, $globalFactory){
      $scope.repo = $globalFactory.repo;
      console.log($scope.repo);

      //to open in browser
      $scope.openURL = function (url) {
        cordova.InAppBrowser.open(url, '_system', 'location=yes');
      };

      //to cash data
      $scope.saveRepoOffline = function (repo) {
        var tempOfflineRepo = JSON.parse(window.localStorage.getItem("offlineRepo"));
        if(tempOfflineRepo == null)
          tempOfflineRepo = {};

        tempOfflineRepo[repo.name] = repo;
        window.localStorage.setItem("offlineRepo", JSON.stringify(tempOfflineRepo));
      };
      //check if already cashed
      $scope.isSavedOffline = function (repo) {
        var tempOfflineRepo = JSON.parse(window.localStorage.getItem("offlineRepo"));
        if(tempOfflineRepo == null)
          tempOfflineRepo = {};

          return (tempOfflineRepo[repo.name])? true:false;
      };
      //to remove from cash
      $scope.deleteOfflineCopy = function(repo){
        var tempOfflineRepo = JSON.parse(window.localStorage.getItem("offlineRepo"));
        if(tempOfflineRepo == null)
          tempOfflineRepo = {};
        else
          delete tempOfflineRepo[repo.name];
        window.localStorage.setItem("offlineRepo", JSON.stringify(tempOfflineRepo));
      };
    }
]);
