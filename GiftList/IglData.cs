using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.Text;
using System.ServiceModel.Activation;
using System.ServiceModel.Web;

namespace GiftList {
    // NOTE: You can use the "Rename" command on the "Refactor" menu to change the interface name "IglData" in both code and config file together.
    [ServiceContract]
    public interface IglData {
        [OperationContract]
        BriefUserList GetLogonUserList(string fName);

		[OperationContract]
		BriefUserList GetRecipientList(int fKey);

		[OperationContract]
		UserList GetUserList(int fKey, int pageSize, int pageIndex, string orderBy);

		[OperationContract]
		string Logon(int userId, string password);

		[OperationContract]
		string LogonByEmail(string eMail, string password);

		[OperationContract]
		cUser GetUserFromSession(string sess);

		[OperationContract]
		List<cListItem> GetList(int User_Key, int rp_fm_key, int recipient);

		[OperationContract]
		cListItem GetItem(int li_Key);

        [OperationContract]
        void DeleteItem(int li_Key);

		[OperationContract]
		string GetEventImages(string session, string fName);

		[OperationContract]
		string GetEventTitle(string session, string fName);

		[OperationContract]
		cUser GetRecipient(int rp_Key);

		[OperationContract]
		void DeleteUser(int rp_Key);

		[OperationContract]
		bool SaveItem(
            int user_Id,
            int li_Key,
			int RecpientKey,
			string ItemTitle,
			string Details,
			int TakenBy,
			int EnteredBy,
			int GotIt,
			string Url,
			int? li_TakenBy,
			int? li_HideFrom,
			string li_GotIt,
			string Color,
			string Size,
			string GiverComment);

		[OperationContract]
		bool SaveUser(cUser user);
	}
}
