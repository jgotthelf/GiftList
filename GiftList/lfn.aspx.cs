using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace GiftList {
	public partial class lfn : System.Web.UI.Page {
		protected void Page_Load(object sender, EventArgs e) {
            Response.Redirect("http://allgiftregistry.azurewebsites.net/logon.htm?f=" + Request.Form["txtFamily"]);
		}
	}
}