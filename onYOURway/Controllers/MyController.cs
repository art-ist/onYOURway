using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

using Breeze.WebApi2;
using Breeze.ContextProvider.EF6;
using System.Web.Http.Cors;
using onYOURway.Models;
using System.Net.Mail;
using System.Text;
using System.IO;
using System.Configuration;

namespace onYOURway.Controllers {

  [EnableCors("*", "*", "*")]
  [BreezeController]
  public class MyController : ApiController {

    readonly EFContextProvider<onYOURwayEntities> db = new EFContextProvider<onYOURwayEntities>();

    [HttpGet]
    public string Metadata() {
      return db.Metadata();
    }

    /// <summary>
    /// Sendet eine Nachricht mit Kontaktdaten
    /// </summary>
    /// <param name="FirstName"></param>
    /// <param name="LastName"></param>
    /// <param name="Company"></param>
    /// <param name="Email"></param>
    /// <param name="Role"></param>
    /// <param name="Project"></param>
    /// <param name="Message"></param>
    /// <param name="a"></param>
    /// <param name="b"></param>
    /// <param name="c"></param>
    /// <returns></returns>
    [HttpPost]
    protected IHttpActionResult Notify(string FirstName, string LastName, string Company, string Email, string Role, string Project, string Message, int a, int b, int c) {
      if (a + b != c) {
        return Unauthorized();
        //ResponseLabel.Text = "Bei der Sicherheitsüberprüfung gegen Spameinträge ist ein Fehler aufgetreten. Stelle sicher, dass die kleine Rechnung neben der Schaltfläche 'Senden' korrekt ausgefüllt ist.";
      }

      try {
        /* Create a new blank MailMessage */
        MailMessage message = new MailMessage();
        message.From = new MailAddress(ConfigurationManager.AppSettings["EmailsFrom"]);
        message.To.Add(ConfigurationManager.AppSettings["EmailsTo"]);
        message.Subject = "onYOURway - Registrierung";
        message.Body = string.Format("{0} {1} hat sich bei onYOURway{4} als {2} eingetragen.\n\n{3}"
                                    , FirstName
                                    , LastName
                                    , Role
                                    , Message
                                    , string.IsNullOrEmpty(Project) ? "" : string.Format(" für Projekt '{0}'", Project)
                                    );

        //create vCard
        VCard vc = new VCard() {
          FirstName = FirstName,
          LastName = LastName,
          Organization = Company,
          JobTitle = Project,
          Email = Email
        };

        /* Attach vCard */
        Encoding enc = Encoding.GetEncoding("windows-1257");
        Attachment card = new Attachment(new MemoryStream(enc.GetBytes(vc.ToString()))
                                        , string.Format("{0} {1}.vcf", FirstName, LastName)
                                        , "text/vcard"
                                        );
        /* Attach the newly created email attachment */
        message.Attachments.Add(card);

        //Send Message
        SmtpClient client = new SmtpClient(); 
        client.Send(message);

        return Ok();
      }
      catch (Exception ex) {
        return InternalServerError(ex);
      }
    }


    /// <summary>
    /// <see cref="http://weblogs.asp.net/gunnarpeipman/archive/2009/08/09/creating-vcard-with-image-in-net.aspx"/>
    /// </summary>
    public class VCard {
      public string FirstName { get; set; }
      public string LastName { get; set; }
      public string Organization { get; set; }
      public string JobTitle { get; set; }
      public string StreetAddress { get; set; }
      public string Zip { get; set; }
      public string City { get; set; }
      public string CountryName { get; set; }
      public string Phone { get; set; }
      public string Mobile { get; set; }
      public string Email { get; set; }
      public string WebSite { get; set; }
      public byte[] Image { get; set; }

      public override string ToString() {
        var builder = new StringBuilder();
        builder.AppendLine("BEGIN:VCARD");
        builder.AppendLine("VERSION:2.1");

        // Name
        builder.AppendLine("N:" + LastName + ";" + FirstName);
        // Full name
        builder.AppendLine("FN:" + FirstName + " " + LastName);

        // Address
        builder.Append("ADR;HOME;PREF:;;");
        builder.Append(StreetAddress + ";");
        builder.Append(City + ";;");
        builder.Append(Zip + ";");
        builder.AppendLine(CountryName);

        // Other data
        builder.AppendLine("ORG:" + Organization);
        builder.AppendLine("TITLE:" + JobTitle);
        builder.AppendLine("TEL;HOME;VOICE:" + Phone);
        builder.AppendLine("TEL;CELL;VOICE:" + Mobile);
        builder.AppendLine("URL;" + WebSite);
        builder.AppendLine("EMAIL;PREF;INTERNET:" + Email);

        builder.AppendLine("END:VCARD");

        return builder.ToString();
      }
    }

  } //class

} //ns
