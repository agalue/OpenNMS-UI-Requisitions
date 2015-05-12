<%@page language="java" contentType="text/html" session="true"  %>
<jsp:include page="/includes/bootstrap.jsp" flush="false">
    <jsp:param name="title" value="Web Console" />
    <jsp:param name="meta"  value='<meta name="description" content="" />' />

    <jsp:param name="link" value='<link rel="stylesheet" type="text/css" href="bower_components/angular-loading-bar/src/loading-bar.css" />' />
    <jsp:param name="link" value='<link rel="stylesheet" type="text/css" href="bower_components/angular-growl-v2/build/angular-growl.min.css" />' />
    <jsp:param name="link-unused" value='<link rel="stylesheet" type="text/css" href="styles/main.css" />' />
    <jsp:param name="link-unused" value='<link rel="stylesheet" type="text/css" href="styles/opennms.css" />' />
    <jsp:param name="link" value='<link rel="stylesheet" type="text/css" href="styles/bootstrap.css" />' />

    <jsp:param name="angularApp" value="onms-requisitions" />
    <jsp:param name="nonavbar" value="true" />
    <jsp:param name="nobase" value="true" />
</jsp:include>

    <div id="requisition-app" class="container-fluid" ng-view></div>
    <div growl></div>

    <!--[if lt IE 9]>
    <script src="bower_components/es5-shim/es5-shim.js"></script>
    <script src="bower_components/json3/lib/json3.min.js"></script>
    <![endif]-->

    <!-- build:js scripts/vendor.js -->
    <!-- bower:js -->
    <script src="bower_components/jquery/dist/jquery.js"></script>
    <script src="bower_components/bootstrap/dist/js/bootstrap.js"></script>
    <script src="bower_components/angular/angular.js"></script>
    <script src="bower_components/angular-resource/angular-resource.js"></script>
    <script src="bower_components/angular-cookies/angular-cookies.js"></script>
    <script src="bower_components/angular-sanitize/angular-sanitize.js"></script>
    <script src="bower_components/angular-route/angular-route.js"></script>
    <script src="bower_components/angular-bootstrap/ui-bootstrap-tpls.js"></script>
    <script src="bower_components/angular-loading-bar/src/loading-bar.js"></script>
    <script src="bower_components/angular-animate/angular-animate.js"></script>
    <script src="bower_components/angular-growl-v2/build/angular-growl.js"></script>
    <script src="bower_components/bootbox/bootbox.js"></script>
    <!-- endbower -->
    <!-- endbuild -->

    <!-- build:js({.tmp,app}) scripts/scripts.js -->
    <script src="scripts/app.js"></script>
    <script src="scripts/model/RequisitionInterface.js"></script>
    <script src="scripts/model/RequisitionNode.js"></script>
    <script src="scripts/model/Requisition.js"></script>
    <script src="scripts/model/RequisitionsData.js"></script>
    <script src="scripts/services/Requisitions.js"></script>
    <script src="scripts/services/Synchronize.js"></script>
    <script src="scripts/filters/startFrom.js"></script>
    <script src="scripts/directives/emptyTypeAhead.js"></script>
    <script src="scripts/controllers/Detector.js"></script>
    <script src="scripts/controllers/Policy.js"></script>
    <script src="scripts/controllers/ForeignSource.js"></script>
    <script src="scripts/controllers/Asset.js"></script>
    <script src="scripts/controllers/Interface.js"></script>
    <script src="scripts/controllers/Node.js"></script>
    <script src="scripts/controllers/Requisition.js"></script>
    <script src="scripts/controllers/Requisitions.js"></script>
    <!-- endbuild -->

<jsp:include page="/includes/bootstrap-footer.jsp" flush="false" />