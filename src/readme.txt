2013-01-15 21:32
Steps taken to build a realtime demo polling a legacy database.

The problem we are trying to solve here is that we have a legacy database that we know that "other" clients (not just our web clients) update rows in the database.
We do not want to have every client connected polling this database for changed information!
One way to solve this is to have ONE client poll the database and if something interesting has happend... then tell the others.
This "client" have to be a longrunning (singleton) controller... At least in the world of XSockets.

1: Created a new MVC4 project

2: Installed CodePlanner from nuget (this is just to simulate a legacy system)
	This gave us 3 new projects
	-Core
	-Data
	-Service

3: Created a really simple domainmodel in my Core project under the Model folder.
	public class Sales : PersistentEntity
	{
		public string Country {get;set;}
		public int Hardware {get;set;}
		public int Software {get;set;}
		public int Services {get;set;}
	}

4: Scaffolded a repository pattern with a service layer using CodePlanners scaffolder
	Just run this command in the "Package Manager Console"
	Scaffold CodePlanner.ScaffoldBackend

5: Installed XSockets by running "Install-Package XSockets" in the "Package Manager Console"

6: Created a new XSockets controller by scaffolding from the package manager console.
	Scaffold XSocketsController SalesController -projectname XSocketsController

	This will create a new class lib project and install XSockets.Core so that controllers can be created.
	
7: Installed Ninject.MVC3 to wire my services to the interfaces in my MVC project...
	Registered my service and repository in NinjectWebCommon and method RegisterServices
	
8: Installed Ninject in the XSocketsControllers project to be able to access the service layer.
	Created the ServiceModule class in the project to get the services...

9: Created/Updated 2 controllers in XSocketsControllers
	- One (SalesController) for communication with the websocket enables clients
	- One (PollingController) as a longrunning controller (singleton) for polling data from the legacy database.

10: Created a MVC-Controller in the webproject (SalesController) to use AJAX from the client to simulate "another" client updating the legacy database.

11: Created a simple HTML-page, added jQuery, XSockets. Also added twitter bootstrap and Wijmo to get a little nicer UI

I have commented the code, but if you have questions just shoot them to uffe@xsockets.net

Regards
Uffe Björklund