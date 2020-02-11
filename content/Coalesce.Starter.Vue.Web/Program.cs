using Coalesce.Starter.Vue.Data;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.IO;

namespace Coalesce.Starter.Vue.Web
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var host = BuildWebHost(args);

            // https://docs.microsoft.com/en-us/aspnet/core/migration/1x-to-2x/#move-database-initialization-code
            using (var scope = host.Services.CreateScope())
            {
                var services = scope.ServiceProvider;

                try
                {
                    // Run database migrations.
                    AppDbContext db = services.GetService<AppDbContext>();
                    db.Initialize();
                }
                catch (Exception ex)
                {
                    var logger = services.GetRequiredService<ILogger<Program>>();
                    logger.LogError(ex, "An error occurred seeding the DB.");
                }
            }
            host.Run();
        }

        public static IWebHost BuildWebHost(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
                .UseWebRoot("wwwroot") // Prevents ASP.NET Core from ignoring wwwroot if it doesn't exist at startup.
                .UseStartup<Startup>()
                .ConfigureAppConfiguration((builder, config) => config 
                    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                    .AddEnvironmentVariables()
                )
                .Build();
    }
}
