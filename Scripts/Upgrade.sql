use xmaslist
go
delete Events where ev_fm_key not in (select fm_key from Families)
delete EventRecip where er_rp_key not in (select rp_key from Recipients)
delete EventRecip where er_ev_key not in (select ev_key from Events)
delete lists where li_rp_key not in (select rp_key from Recipients)
go
alter table Families add constraint pk_fm_key primary key (fm_key)
alter table Events add constraint pk_ev_key primary key (ev_key)
alter table Lists add constraint pk_li_key primary key (li_key)
alter table EventRecip add constraint pk_er_key primary key (er_key)
alter table Recipients add constraint pk_rp_key primary key (rp_key)
alter table Themes add constraint pk_tm_key primary key (tm_key)

alter table Events add constraint fk_ev_fm_key foreign key (ev_fm_key) references Families(fm_key)
alter table Events add constraint fk_ev_tm_key foreign key (ev_tm_key) references Themes(tm_key)

alter table EventRecip add constraint fk_er_rp_key foreign key (er_rp_key) references Recipients(rp_key)
alter table EventRecip add constraint fk_er_ev_key foreign key (er_ev_key) references Events(ev_key)
alter table Recipients add constraint fk_rp_fm_key foreign key (rp_fm_key) references Families(fm_key)

alter table Lists add constraint fk_li_rp_key foreign key (li_rp_key) references Recipients(rp_key)
alter table Lists alter column li_TakenBy int null
alter table Lists alter column li_HideFrom int null
alter table Lists alter column li_Author int not null
update Lists set li_takenby = null where li_takenby = 0
update Lists set li_hidefrom = null where li_hidefrom in (0, -1)
go
alter table Lists add li_Size varchar(30) not null default('')
alter table Lists add li_Color varchar(30) not null default('')
alter table Lists add li_CreateDate datetime not null default ('1/1/1980')
alter table Lists add li_TouchDate datetime not null default ('1/1/1980')

/*
alter table Lists drop constraint fk_li_rp_key foreign key (li_rp_key) references Recipients(rp_key)
alter table Lists drop constraint fk_li_Author foreign key (li_author) references Recipients(rp_key)
alter table Lists drop constraint fk_li_TakenBy foreign key (li_TakenBy) references Recipients(rp_key)
*/
alter table Lists alter column li_TakenBy int null
alter table Lists alter column li_Author int not null
alter table Lists add constraint fk_li_Author foreign key (li_author) references Recipients(rp_key)
alter table Lists add constraint fk_li_takenby foreign key (li_takenby) references Recipients(rp_key)
alter table Lists add constraint fk_li_HideFrom foreign key (li_HideFrom) references Recipients(rp_key)

go
create table LogonLog (
	ll_LogonLog_Key int not null identity(1, 1),
	ll_rp_key int not null,
	ll_sid uniqueidentifier not null,
	ll_Create_Date smalldatetime)
go
alter table LogonLog add constraint pk_ll_LogonLog_Key primary key (ll_LogonLog_Key)


/*
drop table j2
drop table j1
go
create table j1(j int not null)
create table j2(pk int not null, a int, b int, c int)
alter table j1 add constraint j1_pk primary key (j)
alter table j2 add constraint j2_pk primary key (pk)

alter table j2 add constraint fk_a foreign key (a) references j1(j)
alter table j2 add constraint fk_b foreign key (b) references j1(j)
*/