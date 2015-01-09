using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using onYOURway.Controllers;
using onYOURway.Models;
using System.Linq;
using System.Net;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.IO;
using System.Configuration;

namespace onYOURway.Tests {
	[TestClass]
	public class ClientWebAppTests {

		private string host = ConfigurationManager.AppSettings["host"];

		/// <summary>
		/// Runs the client-side QUnit tests
		/// </summary>
		/// <remarks>The main idea is to use these to test the server-API</remarks>
		[TestMethod]
		public void ClientWebAppQUnitTests() {

			throw new NotImplementedException(
				"This test needs to be implemented using an automated browser aproach " +
					"(that doesen't just request the raw html-file but execute it).");
			//see: get https://visualstudiogallery.msdn.microsoft.com/f8741f04-bae4-4900-81c7-7c9bfb9ed1fe for a solution that could work
			//and: check http://stackoverflow.com/questions/24071655/visual-studios-test-runner-with-chutzpah-wont-recognize-qunit-tests-when-using to get it working with durandal

			//Get data from server
			WebClient client = new WebClient();
			var response = new StreamReader(client.OpenRead(host + "/App.Tests/index.html")).ReadToEnd();

			//basic checks on the JSON string
			Assert.IsTrue(response.Contains("0 failed"), response);

		}

	}
}
