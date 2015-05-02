using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data.Entity.Spatial;
using System.Linq;
using System.Web;

namespace onYOURway.Models {

	/// <summary>
	/// Converts DbGeography to WellKnownText
	/// </summary>
	public class DbGeographyWktConverter : JsonConverter {

		public override bool CanConvert(Type objectType) {
			return objectType.IsAssignableFrom(typeof(string));
		}

		public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer) {
			if (reader.TokenType == JsonToken.Null) return null; //default(DbGeography);
			string value = (string)reader.Value;
			if (string.IsNullOrWhiteSpace(value))  return null;
			
			DbGeography converted = DbGeography.FromText(value, 4326);
			return converted;
		}

		public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer) {
			var dbGeography = value as DbGeography;
			serializer.Serialize(writer, dbGeography == null || dbGeography.IsEmpty ? null : ((DbGeography)value).AsText());
		}

	} //DbGeographyConverter

} //ns