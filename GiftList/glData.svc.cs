using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Configuration;
using System.Web.Configuration;
using System.ServiceModel;
using System.Text;
using System.ServiceModel.Activation;
using System.Web.Script.Services;
using atiExtensions;

namespace GiftList {
    [AspNetCompatibilityRequirements(RequirementsMode = AspNetCompatibilityRequirementsMode.Required)]
    public class glData : IglData {
        string cn;
        public glData() {
            this.cn = WebConfigurationManager.ConnectionStrings["xmaslist"].ConnectionString;
        }

        [ScriptMethodAttribute(UseHttpGet = false, ResponseFormat = ResponseFormat.Json)]
        public BriefUserList GetLogonUserList(string fName) {
            BriefUserList theList = new BriefUserList();
            theList.Users = new Dictionary<string, string>();
            using (xmaslistlegacyEntities data = new xmaslistlegacyEntities(this.cn)) {
                var users = from r in data.recipients
                            where r.Family.fm_name.ToLower() == fName.ToLower()
                            orderby r.rp_lastname, r.rp_firstname
                            select new { r.rp_key, r.rp_lastname, r.rp_firstname };
                foreach (var thisUser in users) {
                    if (thisUser.rp_lastname.Trim() == string.Empty)
                        theList.Users.Add(thisUser.rp_key.ToString(), thisUser.rp_firstname.Trim());
                    else
                        theList.Users.Add(thisUser.rp_key.ToString(), thisUser.rp_lastname.Trim() + ", " + thisUser.rp_firstname.Trim());
                }
            }
            return theList;
        }

        [ScriptMethodAttribute(UseHttpGet = false, ResponseFormat = ResponseFormat.Json)]
        public UserList GetUserList(int fKey, int pageSize, int pageIndex, string orderBy) {
            UserList theList = new UserList();
            theList.Users = new List<cUser>();

            using (xmaslistlegacyEntities data = new xmaslistlegacyEntities(this.cn)) {
                var count = from rCount in data.recipients
                            where rCount.rp_fm_key == fKey
                            select rCount;
                theList.TotalRecords = count.Count();

                var users = from r in data.recipients
                            where r.Family.fm_key == fKey
                            orderby r.rp_lastname, r.rp_firstname
                            select new {
                                r.rp_key,
                                r.rp_firstname,
                                r.rp_lastname,
                                r.rp_background,
                                r.rp_recipient,
                                r.rp_giver,
                                r.rp_fm_key,
                                r.Family.fm_name,
                                r.Family.fm_admin_rp_key
                            };
                if (orderBy.Contains("Key"))
                    if (orderBy.Contains("desc"))
                        users = users.OrderByDescending(x => x.rp_fm_key);
                    else
                        users = users.OrderBy(x => x.rp_fm_key);

                else if (orderBy.Contains("LastName"))
                    if (orderBy.Contains("desc"))
                        users = users.OrderByDescending(x => x.rp_lastname).ThenByDescending(x => x.rp_firstname).ThenByDescending(x => x.rp_key);
                    else
                        users = users.OrderBy(x => x.rp_lastname).ThenBy(x => x.rp_firstname).ThenBy(x => x.rp_key);

                else if (orderBy.Contains("FirstName"))
                    if (orderBy.Contains("desc"))
                        users = users.OrderByDescending(x => x.rp_firstname).ThenByDescending(x => x.rp_lastname).ThenByDescending(x => x.rp_key);
                    else
                        users = users.OrderBy(x => x.rp_firstname).ThenBy(x => x.rp_lastname).ThenBy(x => x.rp_key);

                foreach (var thisUser in users.Skip(pageSize * pageIndex).Take(pageSize)) {
                    cUser user = new cUser();

                    user.Family = new cFamily();
                    user.Key = thisUser.rp_key;
                    user.FirstName = thisUser.rp_firstname.Trim();
                    user.LastName = thisUser.rp_lastname.Trim();
                    //user.Background = thisUser.rp_background.Trim();
                    user.Recipient = thisUser.rp_recipient == 1;
                    user.Giver = thisUser.rp_giver == 1;
                    user.Family.Key = thisUser.rp_fm_key;
                    user.Family.Name = thisUser.fm_name.Trim();
                    user.Family.Admin_Key = thisUser.fm_admin_rp_key;

                    theList.Users.Add(user);
                }
            })
            return theList;
        }

        [ScriptMethodAttribute(UseHttpGet = false, ResponseFormat = ResponseFormat.Json)]
        public BriefUserList GetRecipientList(int fKey) {
            BriefUserList theList = new BriefUserList();
            theList.Users = new Dictionary<string, string>();
            using (xmaslistlegacyEntities data = new xmaslistlegacyEntities(this.cn)) {
                var users = from r in data.recipients
                            where r.Family.fm_key == fKey
                            orderby r.rp_lastname, r.rp_firstname
                            select new { r.rp_key, r.rp_lastname, r.rp_firstname };

                foreach (var thisUser in users) {
                    if (thisUser.rp_lastname.Trim() == string.Empty)
                        theList.Users.Add(thisUser.rp_key.ToString(), thisUser.rp_firstname.Trim());
                    else
                        theList.Users.Add(thisUser.rp_key.ToString(), thisUser.rp_lastname.Trim() + ", " + thisUser.rp_firstname.Trim());
                }
            }
            return theList;
        }

        [ScriptMethodAttribute(UseHttpGet = false, ResponseFormat = ResponseFormat.Json)]
        public cUser GetUserFromSession(string sess) {
            cUser user = new cUser();
            using (xmaslistlegacyEntities data = new xmaslistlegacyEntities(this.cn)) {
                var qUser = from ll in data.LogonLog
                            where ll.ll_sid == new Guid(sess)
                            select new {
                                ll.recipients.rp_key,
                                ll.recipients.rp_lastname,
                                ll.recipients.rp_firstname,
                                ll.recipients.rp_background,
                                ll.recipients.rp_recipient,
                                ll.recipients.rp_giver,
                                ll.recipients.Family.fm_name,
                                ll.recipients.Family.fm_key,
                                ll.recipients.Family.fm_admin_rp_key
                            };

                var f = qUser.FirstOrDefault();
                if (f != null) {
                    user.Family = new cFamily();

                    user.Key = f.rp_key;
                    user.FirstName = f.rp_firstname.Trim();
                    user.LastName = f.rp_lastname.Trim();
                    //user.Background = f.rp_background.Trim();
                    user.Recipient = f.rp_recipient == 1;
                    user.Giver = f.rp_giver == 1;
                    user.Family.Key = f.fm_key;
                    user.Family.Name = f.fm_name.Trim();
                    user.Family.Admin_Key = f.fm_admin_rp_key;
                    user.RecordState = "Ok";
                } else
                    user.RecordState = "Err";
            }
            return user;
        }

        [ScriptMethodAttribute(UseHttpGet = false, ResponseFormat = ResponseFormat.Json)]
        public void DeleteItem(int li_Key) {
            using (xmaslistlegacyEntities data = new xmaslistlegacyEntities(this.cn)) {
                var q = from r in data.lists
                        where r.li_key == li_Key
                        select r;

                var itemData = q.FirstOrDefault();
                if (itemData != null) {
                    data.lists.DeleteObject(itemData);
                    data.SaveChanges();
                }

            }
            return;
        }

        [ScriptMethodAttribute(UseHttpGet = false, ResponseFormat = ResponseFormat.Json)]
        public void DeleteUser(int rp_key) {
            using (xmaslistlegacyEntities data = new xmaslistlegacyEntities(this.cn)) {
                var q = from r in data.recipients
                        where r.rp_key == rp_key
                        select r;

                var userData = q.FirstOrDefault();
                if (userData != null) {
                    data.recipients.DeleteObject(userData);
                    data.SaveChanges();
                }

            }
            return;
        }

        [ScriptMethodAttribute(UseHttpGet = false, ResponseFormat = ResponseFormat.Json)]
        public cListItem GetItem(int li_Key) {
            cListItem item = new cListItem();
            using (xmaslistlegacyEntities data = new xmaslistlegacyEntities(this.cn)) {
                var q = from r in data.lists
                        where r.li_key == li_Key
                        select new {
                            ListKey = r.li_key,
                            RecipientKey = r.li_rp_key,
                            li_title = r.li_title.Trim(),
                            li_desc = r.li_desc.Trim(),
                            li_url = r.li_url.Trim(),
                            r.li_takenby,
                            r.li_hidefrom,
                            li_Size = r.li_Size.Trim(),
                            li_Color = r.li_Color.Trim(),
                            li_GotIt = r.li_aquired,
                            r.li_author,
                            r.li_CreateDate,
                            r.li_TouchDate,
                            r.li_GiverComment
                        };

                var itemData = q.FirstOrDefault();
                if (item != null) {
                    item.ListKey = itemData.ListKey;
                    item.ItemTitle = itemData.li_title;
                    item.RecipientKey = itemData.RecipientKey;
                    item.Details = itemData.li_desc;
                    item.Url = itemData.li_url;
                    item.li_TakenBy = itemData.li_takenby;
                    item.li_HideFrom = itemData.li_hidefrom;
                    item.li_GotIt = itemData.li_GotIt;
                    item.Size = itemData.li_Size;
                    item.Color = itemData.li_Color;
                    //if (item.Size == string.Empty)
                    //    item.Size = "&nbsp;";
                    //if (item.Color == string.Empty)
                    //    item.Color = "&nbsp;";
                    item.Author = itemData.li_author;
                    item.CreateDate = itemData.li_CreateDate.ToShortDateString();
                    item.TouchDate = itemData.li_TouchDate.ToShortDateString();
                    if (string.IsNullOrWhiteSpace(itemData.li_GiverComment))
                        item.GiverComment = string.Empty;
                    else
                        item.GiverComment = itemData.li_GiverComment;
                } else {
                    item.ItemTitle = "An error occurred locating this item.  Please email support@augtech.com for assistance.";
                }
            }
            return item;
        }


        public bool SaveItem(
            int user_id,
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
            string GiverComment) {

            using (xmaslistlegacyEntities data = new xmaslistlegacyEntities(this.cn)) {
                bool newRow = false;
                var q = from r in data.lists
                        where r.li_key == li_Key
                        select r;

                var itemData = q.FirstOrDefault();
                if (li_Key == 0) {
                    // new row
                    itemData = new lists();
                    newRow = true;
                }
                itemData.li_title = ItemTitle;
                itemData.li_desc = Details;
                itemData.li_rp_key = RecpientKey;
                itemData.li_url = Url;
                itemData.li_takenby = li_TakenBy <= 0 ? null : li_TakenBy;
                itemData.li_hidefrom = li_HideFrom <= 0 ? null : li_HideFrom;
                itemData.li_Size = Size;
                itemData.li_Color = Color;
                itemData.li_year = DateTime.Now.Year.ToString();
                itemData.li_aquired = li_GotIt == "true" ? (byte)1 : (byte)0;
                itemData.li_GiverComment = GiverComment;
                if (newRow)
                    itemData.li_author = user_id;

                if (li_Key == 0)
                    itemData.li_CreateDate = DateTime.Now;

                itemData.li_TouchDate = DateTime.Now;

                if (newRow)
                    data.lists.AddObject(itemData);
                data.SaveChanges();
            }
            return true;
        }

        public string GetEventImages(string session, string fName) {
            using (xmaslistlegacyEntities data = new xmaslistlegacyEntities(this.cn)) {
                string thisImage = string.Empty;
                try {
                    if (session == string.Empty) {
                        var e = from r in data.Families
                                where r.fm_name == fName
                                select new { r.Events.FirstOrDefault().theme.tm_topimage };

                        var rec = e.FirstOrDefault();
                        if (rec != null)
                            thisImage = e.FirstOrDefault().tm_topimage.Trim();
                        else
                            return "__InvalidFamilyName__";
                    } else {
                        cUser u = GetUserFromSession(session);

                        var e = from r in data.Families
                                where r.fm_key == u.Family.Key
                                select new { r.Events.FirstOrDefault().theme.tm_topimage };

                        thisImage = e.FirstOrDefault().tm_topimage.Trim();
                    }
                } catch (System.Exception e) {
                    return e.InnerException.Message;
                    //   throw new System.Exception(string.Format("Couldn't connect: {0}, {1}", e.Message, this.cn));
                }

                string imageTag = string.Format(@"<img class='TopImage' src='res\{0}' alt='GiftBox' />", thisImage);
                StringBuilder iList = new StringBuilder(imageTag.Length * 5);
                for (int x = 0; x < 5; x++) {
                    iList.Append(imageTag);
                }
                return iList.ToString();
            }
        }

        public string GetEventTitle(string session, string fName) {
            using (xmaslistlegacyEntities data = new xmaslistlegacyEntities(this.cn)) {
                string thisImage = string.Empty;
                try {
                    if (session == string.Empty) {
                        var e = from r in data.Families
                                where r.fm_name == fName
                                select new { r.Events.FirstOrDefault().ev_desc };

                        var rec = e.FirstOrDefault();
                        if (rec != null)
                            return rec.ev_desc.Trim();
                        else
                            return "__InvalidFamilyName__";
                    } else {
                        cUser u = GetUserFromSession(session);

                        var e = from r in data.Families
                                where r.fm_key == u.Family.Key
                                select new { r.Events.FirstOrDefault().ev_desc };

                        return e.FirstOrDefault().ev_desc.Trim();
                    }
                } catch (System.Exception e) {
                    return e.InnerException.Message;
                    //throw new System.Exception(string.Format("Couldn't connect: {0}, {1}", e.Message, this.cn));
                }


            }
        }

        [ScriptMethodAttribute(UseHttpGet = false, ResponseFormat = ResponseFormat.Json)]
        public List<cListItem> GetList(int User_Key, int rp_fm_key, int recipient) {
            List<cListItem> list = new List<cListItem>();

            using (xmaslistlegacyEntities data = new xmaslistlegacyEntities(this.cn)) {
                var l = from r in data.lists
                        select new {
                            r.li_rp_key,
                            r.li_aquired,
                            r.li_author,
                            r.li_hidefrom,
                            r.li_key,
                            r.li_takenby,
                            li_url = r.li_url.Trim(),
                            r.li_Size,
                            r.li_Color,
                            r.Recipient.rp_fm_key,
                            TakenByFirstName = r.TakenBy.rp_firstname.Trim(),
                            TakenByLastName = r.TakenBy.rp_lastname.Trim(),
                            EnteredByFirstName = r.Author.rp_firstname.Trim(),
                            EnteredByLastName = r.Author.rp_lastname.Trim(),
                            li_title = r.li_title.Trim(),
                            li_desc = r.li_desc.Trim(),
                            rp_firstname = r.Recipient.rp_firstname.Trim(),
                            rp_lastname = r.Recipient.rp_lastname.Trim(),
                            r.li_CreateDate,
                            r.li_TouchDate
                        };

                switch (recipient) {
                    case -1: // All Gifts
                        l = l.Where(x => x.rp_fm_key == rp_fm_key);
                        break;
                    case -2: // All Reserved by you
                        l = l.Where(x => x.li_takenby == User_Key);
                        break;
                    case -3: // All unreserved gifts
                        l = l.Where(x => x.rp_fm_key == rp_fm_key);
                        l = l.Where(x => x.TakenByLastName == null);
                        break;
                    case -4: // All available, or reserved by you
                        l = l.Where(x => x.rp_fm_key == rp_fm_key);
                        l = l.Where(x => x.TakenByLastName == null || x.li_takenby == User_Key);
                        break;
                    default:
                        l = l.Where(x => x.li_rp_key == recipient);
                        break;
                }

                // Don't let the user see items entered into their list by somebody else.
                l = l.Where(x => x.li_rp_key != User_Key || x.li_rp_key == x.li_author);
                if (recipient == -3 || recipient == -4) // All Unreserved, and All Available or reserved by you: Don't let them see any items in their list.
                    l = l.Where(x => x.li_rp_key != User_Key);

                foreach (var item in l) {
                    list.Add(new cListItem {
                        ListKey = item.li_key,
                        Recipient = item.rp_firstname.Trim() + " " + item.rp_lastname.Trim(),
                        RecipientKey = recipient,
                        ItemTitle = item.li_title.Trim(),
                        Url = item.li_url,
                        Details = item.li_desc.Trim(),
                        TakenBy = User_Key == item.li_rp_key ? "****************" : item.TakenByLastName == null ? string.Empty : item.TakenByLastName + "," + item.TakenByFirstName,
                        EnteredBy = User_Key == item.li_rp_key ? "****" : item.EnteredByLastName + ", " + item.EnteredByFirstName,
                        GotIt = User_Key == item.li_rp_key ? "****" : item.li_aquired == 1 ? "Yes" : string.Empty,
                        CreateDate = item.li_CreateDate.ToShortDateString(),
                        TouchDate = item.li_TouchDate.ToShortDateString(),
                        Size = item.li_Size,
                        Color = item.li_Color
                    });

                }
            }
            return list;
        }

        [ScriptMethodAttribute(UseHttpGet = false, ResponseFormat = ResponseFormat.Json)]
        public string Logon(int userId, string password) {
            string retVal = "__no__";
            using (xmaslistlegacyEntities data = new xmaslistlegacyEntities(this.cn)) {
                var user = from r in data.recipients
                           where r.rp_key == userId && r.rp_password == password
                           select new { r.rp_key };
                if (user.FirstOrDefault() != null) {
                    var loginLogEntry = new LogonLog();
                    loginLogEntry.ll_rp_key = userId;
                    loginLogEntry.ll_sid = Guid.NewGuid();
                    loginLogEntry.ll_Create_Date = DateTime.Now;

                    data.AddObject("LogonLog", loginLogEntry);
                    data.SaveChanges();
                    retVal = loginLogEntry.ll_sid.ToString();
                }
            }
            return retVal;
        }

        [ScriptMethodAttribute(UseHttpGet = false, ResponseFormat = ResponseFormat.Json)]
        public string LogonByEmail(string eMail, string password) {
            string retVal = "__no__";
            using (xmaslistlegacyEntities data = new xmaslistlegacyEntities(this.cn)) {
                var user = from r in data.recipients
                           where r.rp_email == eMail && r.rp_password == password
                           select new { r.rp_key };
                var thisUser = user.FirstOrDefault();
                if (thisUser != null) {
                    var loginLogEntry = new LogonLog();
                    loginLogEntry.ll_rp_key = thisUser.rp_key;
                    loginLogEntry.ll_sid = Guid.NewGuid();
                    loginLogEntry.ll_Create_Date = DateTime.Now;

                    data.AddObject("LogonLog", loginLogEntry);
                    data.SaveChanges();
                    retVal = loginLogEntry.ll_sid.ToString();
                }
            }
            return retVal;
        }

        [ScriptMethodAttribute(UseHttpGet = false, ResponseFormat = ResponseFormat.Json)]
        public cUser GetRecipient(int rp_Key) {
            cUser u = new cUser();
            using (xmaslistlegacyEntities data = new xmaslistlegacyEntities(this.cn)) {
                try {
                    var r = from q in data.recipients
                            where q.rp_key == rp_Key
                            select q;
                    var thisUser = r.FirstOrDefault();
                    if (thisUser != null) {
                        u.Key = thisUser.rp_key;
                        u.FirstName = thisUser.rp_firstname.Trim();
                        u.LastName = thisUser.rp_lastname.Trim();
                        u.Email = thisUser.rp_email.Trim();
                        u.rp_password = thisUser.rp_password.Trim();
                        u.rp_fm_key = thisUser.rp_fm_key;
                        u.Recipient = thisUser.rp_recipient == 1;
                        u.Giver = thisUser.rp_giver == 1;
                    }
                } catch (System.Exception e) {
                    return new cUser { FirstName = e.InnerException.Message };
                    //throw new System.Exception(string.Format("Couldn't connect: {0}, {1}", e.Message, this.cn));
                }


            }
            return u;
        }

        [ScriptMethodAttribute(UseHttpGet = false, ResponseFormat = ResponseFormat.Json)]
        public bool SaveUser(cUser user) {
            using (xmaslistlegacyEntities data = new xmaslistlegacyEntities(this.cn)) {
                var u = from q in data.recipients
                        where q.rp_key == user.Key
                        select q;
                var userRec = u.FirstOrDefault();
                if (user.Key <= 0) // // New Record
                    userRec = new recipient();

                userRec.rp_firstname = user.FirstName;
                userRec.rp_lastname = user.LastName;
                userRec.rp_password = user.rp_password;
                userRec.rp_email = user.Email;
                userRec.rp_fm_key = user.rp_fm_key;
                userRec.rp_recipient = (byte)user.rp_recipient;
                userRec.rp_giver = (byte)user.rp_giver;

                userRec.rp_background = string.Empty;
                userRec.rp_sound = string.Empty;

                if (user.Key <= 0)
                    data.recipients.AddObject(userRec);
                data.SaveChanges();
            }
            return true;
        }
    }
}
