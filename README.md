# Coalesce Vue Dotnet CLI Template

This template will set up a bare-bones Coalesce Vue solution which you can build your app upon.

For more information on Coalesce, visit: [https://github.com/IntelliTect/Coalesce](https://github.com/IntelliTect/Coalesce)

## Template Installation

From a command prompt, run:

`CMD> dotnet new --install IntelliTect.Coalesce.Vue.Template`

You should now see the template in the listing:

```
CMD> dotnet new --list

Templates                                             Short Name       Language          Tags
------------------------------------------------------------------------------------------------------------
Console Application                                   console          [C#], F#, VB      Common/Console
Class library                                         classlib         [C#], F#, VB      Common/Library
Unit Test Project                                     mstest           [C#], F#, VB      Test/MSTest
xUnit Test Project                                    xunit            [C#], F#, VB      Test/xUnit
ASP.NET Core Empty                                    web              [C#], F#          Web/Empty
ASP.NET Core Web App (Model-View-Controller)          mvc              [C#], F#          Web/MVC
IntelliTect Coalesce Web App Vue Template     	      coalescevue      [C#]              Web/MVC/Vue

```

## Creating a new Coalesce project using the template

1. Make a new folder and open it in a command prompt

1. Run: `CMD> dotnet new coalescevue [-n Optional.Name]`

If you don't specify a name, the template will infer one from the name of the folder you are in.

At this point, you can open up Visual Studio and run the application. However, you will probably want to do the following before running:

1. Create an initial data model by adding EF entity classes to the data project and the corresponding `DbSet<>` properties to `AppDbContext`. You will notice that this project includes a single model, `ApplicationUser`, to start with.
1. Run `dotnet coalesce` to trigger Coalesce's code generation.
1. Run `dotnet ef migrations add Init` (`Init` can be any name) in the data project to create the initial database migration.

After you've started to grow content with your project, consider the following:

* Remove the dummy authentication from `Program.cs` and implement a proper authentication scheme.

# Project Configuration
This project is built on [vite](https://vitejs.dev/). Additional plugins for `vite` may be added as desired.

You are **strongly** encouraged to read through at least the first few pages of the [Vite docs](https://vitejs.dev/guide/why) before getting started on any development.

Project structure of the Web project is as follows:
* `/index.html` - The root document of the SPA application.
* `/src` - Files that should be compiled into your application. CSS/SCSS, TypeScript, Vue SFCs, and so on.
* `/public` - Static assets that should be served as files.
* `/tests` - Vitest tests.
* `/wwwroot` - Target for compiled output.

As always with a Coalesce project, run `dotnet coalesce` to perform code generation.

During development, no special tooling is required to build your frontend code. `UseViteDevelopmentServer` (provided by IntelliTect.Coalesce.Vue) in ASP.NET Core will take care of that automatically when the application starts.

When deploying to production, make sure to build the SPA application with `npm run build`.
