using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;

namespace onYOURway
{
  public class MvcApplication : HttpApplication
  {
    protected void Application_Start()
    {
      AreaRegistration.RegisterAllAreas();

      FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
      GlobalConfiguration.Configure(WebApiConfig.Register); //App_Start/WebApiConfig  - ATTENTION: must be loaded before RouteConfig
      RouteConfig.RegisterRoutes(RouteTable.Routes);        //App_Start/RouteConfig

      BundleConfig.RegisterBundles(BundleTable.Bundles);
    }
  }
}
