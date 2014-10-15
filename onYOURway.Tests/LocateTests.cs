using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using onYOURway.Controllers;
using onYOURway.Models;
using System.Linq;
using System.Net;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.IO;

namespace onYOURway.Tests {
  [TestClass]
  public class LocateControllerTests {

    private string host = "http://onYOURway.at";

    [TestMethod]
    public void Locate_Regions_Controller() {

      //Get data from controller
      var locateController = new LocateController();
      Region[] regions = locateController.Regions().ToArray();

      Assert.IsNotNull(regions);
      Assert.IsTrue(regions.Count() > 0, "At least one region should be returned");
      Assert.IsTrue(regions[0].Name == "Baden", "Name of first Region should be 'Baden' but is '{0}'.", regions[0].Name);
    }
    [TestMethod]
    public void Locate_Regions_Api() {
      
      //Get data from server
      WebClient client = new WebClient();
      var response = new StreamReader(client.OpenRead(host + "/api/Locate/Regions")).ReadToEnd();

      //basic checks on the JSON string
      Assert.IsTrue(response.Contains("Baden"), "JSON should contain 'Baden'.");

      ////try to deserialize to an Array of Region
      //var regions = JsonConvert.DeserializeObject<Region[]>(response);

      //Assert.IsNotNull(regions);
      //Assert.IsTrue(regions.Count() > 0, "At least one region should be returned");
      //Assert.IsTrue(regions[0].Name == "Baden", "Name of first Region should be 'Baden bei Wien' but is '{0}'.", regions[0].Name);
    }

  }
}
