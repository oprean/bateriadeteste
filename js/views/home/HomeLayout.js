define([
  'jquery',
  'underscore',
  'backbone',
  'backbone.marionette',
  'views/home/NormalHomeLayout',
  'views/home/AdminDashboardLayout',
  'views/home/AdminHomeLayout',
  'text!templates/home/home-layout.html',
  'components/Events',
  'components/Constants',
  'components/Utils'
], function($, _, Backbone, Marionette, NormalHomeLayout, AdminDashboardLayout, AdminHomeLayout, homeLayoutTpl, vent, Constants, Utils){
  var HomeLayout = Backbone.Marionette.LayoutView.extend({
    template : _.template(homeLayoutTpl),
    regions : {
        main : '.home-container',
    },
       
    events : {
    },
    
    initialize : function() {
        vent.trigger('router.page.info.update',{bcs:[{href:'#', text:i18n.t('hello')+' '+appUser.username}]});
        console.log(appUser);
        if (appUser.isAdmin) {
            this.homeView = new AdminDashboardLayout();
        } else {
            switch(appUser.type) {
                case Constants.USER_TYPE_LEADER:
                case Constants.USER_TYPE_EDITOR:
                case Constants.USER_TYPE_TRANSLATOR:
                case Constants.USER_TYPE_NORMAL:
                case Constants.USER_TYPE_GUEST:      
                case Constants.USER_TYPE_NORMAL:
                    this.homeView = new NormalHomeLayout();
                    break;
                case Constants.USER_TYPE_ADMIN:
                    this.homeView = new AdminDashboardLayout();
                    break;
                default:
                    this.homeView = new NormalHomeLayout();
                    break;
            };   
        }
    },
       
    onBeforeShow: function() {
        this.showChildView('main', this.homeView);
    }
  });

  return HomeLayout;
});