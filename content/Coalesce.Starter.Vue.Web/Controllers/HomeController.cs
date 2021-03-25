using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;

namespace Coalesce.Starter.Vue.Web.Controllers
{
    public class HomeController : Controller
    {
        /// <summary>
        /// Spa route for vue-based parts of the app
        /// </summary>
        // Prevent caching of this route.
        // The served file will contain the links to compiled js/css that include hashes in the filenames.
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Index(
            [FromServices] IWebHostEnvironment hostingEnvironment
        )
        {
            var fileInfo = hostingEnvironment.WebRootFileProvider.GetFileInfo("index.html");

            if (!fileInfo.Exists)
            {
                return Ok($"{fileInfo.PhysicalPath} not found. HMR build is probably still running for the first time. Keep refreshing...");
            }

            var readStream = fileInfo.CreateReadStream();
            return File(readStream, "text/html");
        }

        public IActionResult Error()
        {
            ViewData["RequestId"] = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
            return View();
        }
    }
}
