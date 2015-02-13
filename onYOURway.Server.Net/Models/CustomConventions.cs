using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration.Conventions;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.Core.Metadata.Edm;
using System.Data.Entity.Infrastructure;
 
namespace System.ComponentModel.DataAnnotations {

	[AttributeUsage( AttributeTargets.Class | AttributeTargets.Property, AllowMultiple = false )]
	public partial class UIAttribute : Attribute {
		public String CssIconClass { get; set; }
		public String Template { get; set; }
	}
}

namespace System.ComponentModel.DataAnnotations.Schema {

	[AttributeUsage(AttributeTargets.Property, AllowMultiple = false)]
	public class NonUnicodeAttribute : Attribute {
	}

	[AttributeUsage(AttributeTargets.Property, AllowMultiple = false)]
	public class DateOnlyAttribute : Attribute {
	}

	[AttributeUsage(AttributeTargets.Property, AllowMultiple = false)]
	public class TimeOnlyAttribute : Attribute {
	}

}

namespace onYOURway.Models {

	/// <summary>
	/// Customize the default modeling behaviour
	/// </summary>
	public class onYOURwayConventions {

		public class CustomAttributesConvention : Convention {

			//DefaultDateTimeConvention
			public CustomAttributesConvention() {

				this.Properties()
					.Where(x => x.GetCustomAttributes(typeof(NonUnicodeAttribute), true).Any())
					.Configure(c => c.IsUnicode(false));
				//.Configure(c => c.HasColumnType("varchar"));

				this.Properties()
					.Where(x => x.GetCustomAttributes(typeof(DateOnlyAttribute), true).Any())
					.Configure(c => c.HasColumnType("date"));

				this.Properties()
					.Where(x => x.GetCustomAttributes(typeof(TimeOnlyAttribute), true).Any())
					.Configure(c => c.HasColumnType("time"));

				this.Properties()
					.Where(x => x.GetCustomAttributes(typeof(TimeSpan), true).Any())
					.Configure(c => c.HasColumnType("int"));

			}

		} //CustomAttributesConvention

		/// <summary>
		/// 
		/// </summary>
		public class SqlServerDefaultTypesConvention : Convention {
			public SqlServerDefaultTypesConvention() {

				this.Properties<DateTime>()
						.Configure(c => c.HasColumnType("datetime2"));

				this.Properties<DateTime>()
						.Configure(c => c.HasPrecision(3)); //see also: http://tech.pro/blog/1233/beware-of-datetimeoffset-precision-and-javascript


			}
		}  //SqlServerDefaultTypesConvention

		/// <summary>
		/// Provides a convention for fixing the independent association (IA) foreign key column names.
		/// </summary>
		public class ForeignKeyNamingConvention : IStoreModelConvention<AssociationType> {

			public void Apply(AssociationType association, DbModel model) {
				// Identify a ForeignKey properties (including IAs)
				if (association.IsForeignKey) {
					// rename FK columns
					var constraint = association.Constraint;
					if (DoPropertiesHaveDefaultNames(constraint.FromProperties, constraint.ToRole.Name, constraint.ToProperties)) {
						NormalizeForeignKeyProperties(constraint.FromProperties);
					}
					if (DoPropertiesHaveDefaultNames(constraint.ToProperties, constraint.FromRole.Name, constraint.FromProperties)) {
						NormalizeForeignKeyProperties(constraint.ToProperties);
					}
				}
			}

			private bool DoPropertiesHaveDefaultNames(ReadOnlyMetadataCollection<EdmProperty> properties, string roleName, ReadOnlyMetadataCollection<EdmProperty> otherEndProperties) {
				if (properties.Count != otherEndProperties.Count) {
					return false;
				}

				for (int i = 0; i < properties.Count; ++i) {
					if (!properties[i].Name.EndsWith("_" + otherEndProperties[i].Name)) {
						return false;
					}
				}
				return true;
			}

			private void NormalizeForeignKeyProperties(ReadOnlyMetadataCollection<EdmProperty> properties) {
				for (int i = 0; i < properties.Count; ++i) {
					string defaultPropertyName = properties[i].Name;
					int ichUnderscore = defaultPropertyName.IndexOf('_');
					if (ichUnderscore <= 0) {
						continue;
					}
					string navigationPropertyName = defaultPropertyName.Substring(0, ichUnderscore);
					string targetKey = defaultPropertyName.Substring(ichUnderscore + 1);

					string newPropertyName;
					if (targetKey.StartsWith(navigationPropertyName)) {
						newPropertyName = targetKey;
					}
					else {
						newPropertyName = navigationPropertyName + targetKey;
					}
					properties[i].Name = newPropertyName;
				}
			}

		}

	} //ForeignKeyNamingConvention

}


