using AspNetCore.SpaYarp;
using Coalesce.Starter.Vue.Data;
using IntelliTect.Coalesce;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Net.Http.Headers;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System.Security.Claims;
using System.Text.RegularExpressions;

var builder = WebApplication.CreateBuilder(new WebApplicationOptions { 
    Args = args,
    // Explicit declaration prevents ASP.NET Core from erroring if wwwroot doesn't exist at startup:
    WebRootPath = "wwwroot" 
});

var configuration = builder.Configuration;
var services = builder.Services;


#region Configure Services

builder.Logging.AddConsole();
    //.AddFilter("Microsoft", LogLevel.Warning).AddFilter("Yarp", LogLevel.Warning).AddFilter("AspNetCore", LogLevel.Warning);
builder.Configuration
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddEnvironmentVariables();

services.AddSingleton<IConfiguration>(configuration);
services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

services.AddCoalesce<AppDbContext>();

// spa

// end spa

services
    .AddMvc()
    .AddNewtonsoftJson(options =>
    {
        options.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
        options.SerializerSettings.Formatting = Formatting.Indented;
        options.SerializerSettings.NullValueHandling = NullValueHandling.Ignore;
        options.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
    });

services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
        .AddCookie();

#endregion



#region Configure HTTP Pipeline

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();

    app.UseWhen(c => c.Request.Path.StartsWithSegments("/vite_hmr"), app =>
    {
        //app.Use(async (context, next) =>
        //{
        //    // Vite will redirect "/" to its configured base path.
        //    if (context.Request.Path == "/")
        //    {
        //        context.Request.Path = "/vite_hmr/";
        //    }
        //    await next();

        //});
        app.UseSpa(spa =>
        {
            spa.Options.SourcePath = ".";
            //spa.Options.DevServerPort = 8080;
            //spa.UseReactDevelopmentServer(npmScript: "dev");
            ReactDevelopmentServerMiddleware.Attach(spa, "dev");
        });
    });

    // TODO: Dummy authentication for initial development.
    // Replace this with ASP.NET Core Identity, Windows Authentication, or some other scheme.
    // This exists only because Coalesce restricts all generated pages and API to only logged in users by default.
    app.Use(async (context, next) =>
    {
        Claim[] claims = new[] { new Claim(ClaimTypes.Name, "developmentuser") };

        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        await context.SignInAsync(context.User = new ClaimsPrincipal(identity));

        await next.Invoke();
    });
    // End Dummy Authentication.
}


app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

var containsFileHashRegex = new Regex(@"\.[0-9a-fA-F]{8}\.[^\.]*$", RegexOptions.Compiled);
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        // vue-cli puts 8-hex-char hashes before the file extension.
        // Use this to determine if we can send a long-term cache duration.
        if (containsFileHashRegex.IsMatch(ctx.File.Name))
        {
            ctx.Context.Response.GetTypedHeaders().CacheControl =
                new CacheControlHeaderValue { Public = true, MaxAge = TimeSpan.FromDays(30) };
        }
    }
});

// For all requests that aren't to static files, disallow caching.
app.Use(async (context, next) =>
{
    context.Response.GetTypedHeaders().CacheControl =
        new CacheControlHeaderValue { NoCache = true, NoStore = true, };

    await next();
});

app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers();

    // API fallback to prevent serving SPA fallback to 404 hits on API endpoints.
    endpoints.Map("api/{**any}", ctx => { ctx.Response.StatusCode = StatusCodes.Status404NotFound; return Task.CompletedTask; });

    endpoints.MapFallbackToController("Index", "Home");
});

#endregion



#region Launch

// Initialize/migrate database.
using (var scope = app.Services.CreateScope())
{
    var serviceScope = scope.ServiceProvider;

    // Run database migrations.
    using var db = serviceScope.GetService<AppDbContext>();
    db.Initialize();
}

app.Run();

#endregion
