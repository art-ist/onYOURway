using Breeze.ContextProvider.EF6;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using onYOURway;
using onYOURway.Models;
using System.Text.RegularExpressions;
using Breeze.ContextProvider;

namespace onYOURway.Controllers {

	public class onYOURwayContextProvider : EFContextProvider<onYOURwayDbContext> {
		public onYOURwayContextProvider() : base() { }

		//protected override bool BeforeSaveEntity(EntityInfo entityInfo) {
		//	//get security context
		//	User user = null;
		//	var securityContext = HttpContext.Current;
		//	if (securityContext != null && securityContext.User != null) {
		//		//var userName = securityContext.User.Identity;	
		//		//user = this.Context.Users.SingleOrDefault(u => u.UserName == userName);
		//		user = securityContext.User as User;

		//	}

		//	////get entity
		//	//BusinessObject entity = entityInfo.Entity as BusinessObject;
		//	//if (entity != null) {
		//	//	return entity.BeforeSave(entityInfo, user);
		//	//}

		//	return true;
		//	// return false if we don’t want the entity saved.
		//}

		//TODO: enforce update security
		//protected override Dictionary<Type, List<EntityInfo>> BeforeSaveEntities(Dictionary<Type, List<EntityInfo>> saveMap) {
		//	// return a map of those entities we want saved.
		//	return saveMap;
		//}

	} //class onYOURwayContextProvider

} //ns