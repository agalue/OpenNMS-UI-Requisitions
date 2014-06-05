OpenNMS-UI-Requisitions
=======================

A user interface to manage OpenNMS Requisition implemented with AngularJS and Bootstrap 3

IMPORTANT: This required at least OpenNMS 1.13.4-SNASHOT compiled after 2014-06-05

Compilation Instructions
=======================

Here is the step-by-step guide for testing the UI with OpenNMS:

* Install NodeJS (http://www.nodejs.org/)

* Install Required Libraries through NodeJS:

```
sudo npm install -g grunt bower 
```

* Install Third-Party libraries on the project directory

```
cd OpenNMS-UI-Requisitions/
npm install
bower install
```

* If requested, specify Angular 1.2.15

* Install the latest OpenNMS RPM from http://yum.opennms.org/bleeding/common/opennms/

* Copy over OpenNMS-UI-Requisitions/ into jetty-webapps/opennms/ as ng-requisition, for example:

```
sudo rsync -avr OpenNMS-UI-Requisitions/ /opt/opennms/jetty-webapps/opennms/admin/ng-requisitions/
```

* Start OpenNMS

* Log in as administrator and open the following URL:

```
http://localhost:8980/opennms/admin/ng-requisitions/app/index.html
```

Enjoy!

