OpenNMS-UI-Requisitions
=======================

A user interface to manage OpenNMS Requisition implemented with AngularJS and Bootstrap 3

This project was designed and implemented to work with OpenNMS 14 or greater. It is not going to work with 1.12 or older versions.

Versions:

* 1.0.x OpenNMS Horizon 14 and 15; OpenNMS Meridian 2015.1.0
* 1.1.x OpenNMS Horizon 16
* 1.2.x OpenNMS Horizon 17 and newer
* 1.3.x OpenNMS Horizon 18 and newer (webpack version)

NOTE: Starting with Horizon 17, OpenNMS already includes this app to manage requisitions.

The current implementation of the application retrieves all the configured requisitions from the OpenNMS server (deployed or not) using the ReST API, and stores the merged data on an internal cache on the browser to improve the user experience and the response time of the application. For this reason, this application is not intended to be used by several users at the same time.

Every time you perform a change on any of the requisitions component and a save operation is requested, the application pushes the change to the OpenNMS server using the ReST API and updates the internal cache.

For a big number of requisitions and nodes, it is required to wait several minutes until all the requisitions are retrieved from the server. This is a delay inherent to the OpenNMS server. The relevant fact is that this delay happens only once, as the rest of read operations are going to be performed against the internal cache, unless the user instructs the application to re-read the data from the server.

Despite the initial delay, the overall performance of the application is drastically faster compared with the current implementation of the WebUI for managing requisitions in OpenNMS.

Compilation Instructions
=======================

Follow this step-by-step guide for installing and using the UI with OpenNMS:

* Install NodeJS (http://www.nodejs.org/)

* Install Third-Party libraries on the project directory

```
cd OpenNMS-UI-Requisitions/
npm install
npm run build
```

* Install the latest stable OpenNMS

* Copy over `OpenNMS-UI-Requisitions/dist/` into `jetty-webapps/opennms/admin/` as `ng-requisitions`, for example:

```
sudo rsync -avr OpenNMS-UI-Requisitions/dist/ $OPENNMS_HOME/jetty-webapps/opennms/admin/ng-requisitions/
```

Or, edit `$OPENNMS_HOME/jetty-webapps/WEB-INF/web.xml`, find a settings called 'aliases', change its value to be 'true', and finally add a symbolic link from `OpenNMS-UI-Requisitions/dist/` to `$OPENNMS_HOME/jetty-webapps/opennms/admin/ng-requisitions/`

* Start OpenNMS

* Log in as administrator and open the following URL:

```
http://localhost:8980/opennms/admin/ng-requisitions/index.html
```

Enjoy!

