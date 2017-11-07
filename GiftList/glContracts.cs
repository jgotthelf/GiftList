using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Runtime.Serialization;
using atiExtensions;

namespace GiftList {
	[DataContract]
	public class BriefUserList {
		[DataMember]
		public Dictionary<string, string> Users { get; set; }
	}

	public class UserList {
		[DataMember]
		public List<cUser> Users { get; set; }

		[DataMember]
		public int TotalRecords { get; set; }
	}
	public class cFamily {
		public int Key { get; set; }
		public string Name { get; set; }
		public int Admin_Key { get; set; }
	}

	public class cListItem {
		private string size;
		private string color;
		private string url;

		public int ListKey { get; set; }
		public string Recipient { get; set; }
		public int RecipientKey { get; set; }
		public string ItemTitle { get; set; }
		public string Details { get; set; }
		public string TakenBy { get; set; }
		public string EnteredBy { get; set; }
		public string GotIt { get; set; }
		public string Url { get { return url; } set { url = value.Left(750); } }
		public int? li_TakenBy { get; set; }
		public int li_rp_Key { get; set; }
		public int? li_HideFrom { get; set; }
		public Int16 li_GotIt { get; set; }
		public string CreateDate { get; set; }
		public string TouchDate { get; set; }
		public int Author { get; set; }
		public string GiverComment { get; set; }
		public string Size {
			get {
				return size;
			}
			set {
				size = value.Left(30);
			}
		}
		public string Color {
			get {
				return color;
			}
			set {
				color = value.Left(30);
			}
		}
	}

	public class cUser {
		public int Key { get; set; }
		public string FirstName { get; set; }
		public string LastName { get; set; }
		public string Email { get; set; }
		public bool Recipient { get; set; }
		public bool Giver { get; set; }
		public cFamily Family { get; set; }
		public string RecordState { get; set; }
		public string rp_password { get; set; }
		public int rp_fm_key { get; set; }
		public Int16 rp_recipient { get; set; }
		public Int16 rp_giver { get; set; }
	}
}
