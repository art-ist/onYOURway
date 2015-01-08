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

	/// <summary>
	/// 
	/// </summary>
	/// <remarks>
	///	This is just a mockup implementation to conigure and schow how to write these tests.
	///	Actual code coverage is close to zero (yet, I hope ;-)
	/// </remarks>
	[TestClass]
	public class LocateControllerTests {

		[TestMethod]
		public void Locate_Regions_Controller() {

			//Get data from controller
			var locateController = new LocateController();
			Region[] regions = locateController.Regions().ToArray();

			Assert.IsNotNull(regions);
			Assert.IsTrue(regions.Count() > 0, "At least one region should be returned");
			Assert.IsTrue(regions[0].Name == "Baden", "Name of first Region should be 'Baden' but is '{0}'.", regions[0].Name);
		} 

	} //class LocateControllerTests
} //ns
