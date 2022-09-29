using Microsoft.EntityFrameworkCore;
using Coalesce.Starter.Vue.Data.Models;

namespace Coalesce.Starter.Vue.Data;

[Coalesce]
public class AppDbContext : DbContext
{
    public DbSet<ApplicationUser> ApplicationUsers => Set<ApplicationUser>();

    public AppDbContext()
    {
    }

    public AppDbContext(DbContextOptions options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Remove cascading deletes.
        foreach (var relationship in builder.Model.GetEntityTypes().SelectMany(e => e.GetForeignKeys()))
        {
            relationship.DeleteBehavior = DeleteBehavior.Restrict;
        }
    }

    /// <summary>
    /// Migrates the database and sets up items that need to be set up from scratch.
    /// </summary>
    public void Initialize()
    {
        try
        {
            this.Database.Migrate();
            
            // TODO: Or, use Database.EnsureCreated() instead:
            // this.Database.EnsureCreated();
        }
        catch (InvalidOperationException e) when (e.Message == "No service for type 'Microsoft.EntityFrameworkCore.Migrations.IMigrator' has been registered.")
        {
            // this exception is expected when using an InMemory database
        }
    }
}
