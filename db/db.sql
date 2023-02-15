drop database if exists d0018e_store;
create database d0018e_store;

create table d0018e_store.user(
  user_id     serial,
  first_name  varchar(15)             not null,
  last_name   varchar(15)             not null,
  email       varchar(50)   unique    not null,
  password    char(64)                not null,

  constraint pk_user primary key(user_id),

  constraint `user.email` check (`email` regexp "^[a-za-z0-9][a-za-z0-9.!#$%&'*+-/=?^_`{|}~]*?[a-za-z0-9._-]?@[a-za-z0-9][a-za-z0-9._-]*?[a-za-z0-9]?\\.[a-za-z]{2,63}$")
);

create table d0018e_store.shopping_basket(
  shopping_basket_id    serial,
  user_id               bigint  unsigned    unique    not null,

  constraint pk_shopping_basket primary key(shopping_basket_id),

  constraint fk_user_shopping_basket 
  foreign key(user_id) references d0018e_store.user(user_id)
  on delete no action
  on update cascade
);

create table d0018e_store.`order`(
  order_id              serial,
  user_id               bigint            unsigned    not null,
  shopping_basket_id    bigint            unsigned    not null,
  order_date            datetime                      not null,

  constraint pk_order primary key(order_id),

  constraint fk_user_order 
  foreign key(user_id) references d0018e_store.user(user_id)
  on delete no action
  on update cascade,

  constraint fk_shopping_basket_order 
  foreign key(shopping_basket_id) references d0018e_store.shopping_basket(shopping_basket_id)
  on delete no action
  on update cascade
);

create table d0018e_store.subject(
  subject_id        serial,
  name              varchar(50)   unique    not null,

  constraint pk_subject primary key(subject_id)
);

create table d0018e_store.asset(
  asset_id      serial,
  subject_id    bigint        unsigned,
  title         varchar(50)   unique,
  price         double        unsigned   not null,
  amount        bigint        unsigned   not null,
  description   varchar(150),

  constraint pk_asset primary key(asset_id),

  constraint fk_subject_asset
  foreign key(subject_id) references d0018e_store.subject(subject_id)
  on delete set null
  on update cascade
);

create table d0018e_store.order_asset(
  order_asset_id  serial,
  order_id        bigint     unsigned   not null,
  asset_id        bigint     unsigned   not null,
  asset_amount    bigint     unsigned   not null,

  constraint pk_order_asset primary key(order_asset_id),

  constraint fk_order_order_asset 
  foreign key(order_id) references d0018e_store.`order`(order_id)
  on delete no action
  on update cascade,

  constraint fk_asset_order_asset 
  foreign key(asset_id) references d0018e_store.asset(asset_id),

  constraint uc_comment unique(order_id, asset_id)
);

create table d0018e_store.shopping_basket_asset(
  shopping_basket_asset_id  serial,
  shopping_basket_id        bigint   unsigned   not null,
  asset_id                  bigint   unsigned   not null,
  asset_amount              bigint   unsigned   not null,
  when_added                datetime            not null,

  constraint pk_shopping_basket_asset primary key(shopping_basket_asset_id),

  constraint fk_shopping_basket_shopping_basket_asset 
  foreign key(shopping_basket_id) references d0018e_store.shopping_basket(shopping_basket_id)
  on delete no action
  on update cascade,

  constraint fk_asset_shopping_basket_asset 
  foreign key(asset_id) references d0018e_store.asset(asset_id)
  on delete no action
  on update cascade,

  constraint uc_shopping_basket_asset unique(shopping_basket_id, asset_id)
);

create table d0018e_store.comment(
  comment_id      serial,
  user_id         bigint        unsigned      not null,
  order_asset_id  bigint        unsigned      not null,
  rating          bigint        unsigned      not null,
  comment_text    varchar(150)                not null,

  constraint pk_comment primary key(comment_id),

  constraint fk_user_comment 
  foreign key(user_id) references d0018e_store.user(user_id)
  on delete no action
  on update cascade,

  constraint fk_order_asset_comment 
  foreign key(order_asset_id) references d0018e_store.order_asset(order_asset_id)
  on delete no action
  on update cascade,

  constraint uc_comment unique(user_id, order_asset_id)
);

insert into d0018e_store.user 
(first_name,  last_name,  email,                        password) values 
('janne',     'jansson',  'janne_jansson@coldmail.com', 'd539c3fc39720e54ede1d1bd5081b82b34fd00f755a70fcd73685ff41cae3f15');

insert into d0018e_store.shopping_basket 
(user_id) values 
(1);

insert into d0018e_store.subject 
(name) values 
("math");

insert into d0018e_store.asset
(subject_id,  title,                        price,    amount,   description) values 
(1,           "matematik för nybörjare",    10.50,    3,        "matematik för alla åldrar!");

insert into d0018e_store.shopping_basket_asset
(shopping_basket_id,  asset_id,   asset_amount,   when_added) values 
(1,                   1,          1,              now());

/*
------------------------------------------------------------------------
  triggers
------------------------------------------------------------------------
*/

delimiter $$

create trigger d0018e_store.email_to_lower 
before insert on d0018e_store.`user` for each row
  begin
    set new.email := lower(new.email);
  end $$

create trigger d0018e_store.process_shopping_basket_asset 
before insert on d0018e_store.shopping_basket_asset for each row
    begin
      declare curamount bigint unsigned;

      set curamount := (select amount from d0018e_store.asset a where a.asset_id=new.asset_id);
      if (curamount < new.asset_amount) then
        signal sqlstate '45000' set message_text = 'error: insufficient amount of provided item';
      elseif (new.asset_amount <= 0) then
        signal sqlstate '45000' set message_text = 'error: the amount of items added to the shopping cart must be greater than zero';
      else
        update d0018e_store.asset set amount=amount-new.asset_amount where asset_id=new.asset_id; 
      end if;
end $$

create trigger d0018e_store.process_order_asset 
before insert on d0018e_store.order_asset for each row
    begin
      declare var_asset_amount bigint unsigned;
      declare var_user_id bigint unsigned;
      declare var_shopping_basket_id bigint unsigned;

        select user_id into var_user_id from `order` where order_id=new.order_id;
        select shopping_basket_id into var_shopping_basket_id from shopping_basket where user_id=var_user_id;
        select asset_amount into var_asset_amount from shopping_basket_asset sa where sa.asset_id=new.asset_id and shopping_basket_id=var_shopping_basket_id;
      if (var_asset_amount < new.asset_amount) then
        signal sqlstate '45000' set message_text = 'error: insufficient amount of provided item';
      elseif (new.asset_amount <= 0) then
        signal sqlstate '45000' set message_text = 'error: the amount of items added to the shopping cart must be greater than zero';
      else
        update d0018e_store.shopping_basket_asset set asset_amount=asset_amount-new.asset_amount where asset_id=new.asset_id and shopping_basket_id=var_shopping_basket_id; 
      end if;
end $$

/*
------------------------------------------------------------------------
  procedures
------------------------------------------------------------------------
*/

/*
example:

call d0018e_store.add_user('jörgen', 'jansson', 'lol@asda.asda', 'ee63de13a90f349c50861829006bfe26338de8f2eabebfb6c30f40469e710891');

*/
create procedure d0018e_store.add_user 
(
  in par_first_name varchar(15), 
  in par_last_name varchar(15),
  in par_email varchar(50),
  in par_password char(64)
)
  begin
    declare var_user_id bigint; 

    insert into `user` 
    (first_name,      last_name,      email,              password) values
    (par_first_name,  par_last_name,  lower(par_email),   par_password);

    select user_id into var_user_id from `user` where lower(email)=lower(par_email); 
    if var_user_id is not null then
      insert into shopping_basket (user_id) values (var_user_id);
    end if;
  end $$

/*
example:

call d0018e_store.add_item_to_shopping_basket(1, 3, 'janne_jansson@coldmail.com');

*/
create procedure d0018e_store.add_item_to_shopping_basket
(
  in par_asset_id bigint, 
  in par_asset_amount bigint,
  in par_email varchar(50)
)
  begin
    declare var_user_id bigint; 
    declare var_shopping_basket_id bigint; 
    
    select user_id into var_user_id from `user` u where lower(email)=lower(par_email);
    if var_user_id is not null then
      select shopping_basket_id into var_shopping_basket_id from shopping_basket where user_id=var_user_id;
    else
      signal sqlstate '45000' set message_text = 'error: user not found';
    end if;

    insert into shopping_basket_asset 
    (shopping_basket_id,      asset_id,       asset_amount,     when_added) values
    (var_shopping_basket_id,  par_asset_id,   par_asset_amount, now());
  end $$

/*
example:

call d0018e_store.create_order('janne_jansson@coldmail.com');

*/
create procedure d0018e_store.create_order 
(
  in par_email varchar(50) 
)
  begin
    declare var_user_id bigint;
    declare var_shopping_basket_id bigint;

    select u.user_id into var_user_id from `user` u where lower(email)=lower(par_email);
    
    select shopping_basket_id into var_shopping_basket_id from shopping_basket sb
    where sb.user_id=var_user_id; 

    if var_user_id is not null and var_shopping_basket_id is not null then
      insert into `order` 
      (user_id,       shopping_basket_id,       order_date) values
      (var_user_id,   var_shopping_basket_id,   now());
    end if;
  end $$

/*
example:

call d0018e_store.add_order_asset(1, 1, 3);

*/
create procedure d0018e_store.add_order_asset 
(
  in par_order_id bigint,
  in par_asset_id bigint,
  in par_asset_amount bigint
)
  begin
    insert into order_asset
    (order_id,      asset_id,       asset_amount) values
    (par_order_id,  par_asset_id,   par_asset_amount);
  end $$

/*
------------------------------------------------------------------------
  events
------------------------------------------------------------------------
*/

delimiter ;

set global event_scheduler = on;

create event d0018e_store.clean_shopping_basket
    on schedule
      every 3 second
    do
        delete from d0018e_store.shopping_basket_asset where shopping_basket_asset_id in (select shopping_basket_asset_id from shopping_basket_asset where when_added < date_sub(now(), interval 30 minute));