drop database if exists d0018e_store;
create database d0018e_store;

create table d0018e_store.user(
  user_id     serial,
  first_name  varchar(15)             not null,
  last_name   varchar(15)             not null,
  email       varchar(50)   unique    not null,
  password    varchar(70)                not null,

  constraint pk_user primary key(user_id),

  constraint `user.email` check (`email` regexp "^[a-za-z0-9][a-za-z0-9.!#$%&'*+-/=?^_`{|}~]*?[a-za-z0-9._-]?@[a-za-z0-9][a-za-z0-9._-]*?[a-za-z0-9]?\\.[a-za-z]{2,63}$")
);

create table d0018e_store.shopping_basket(
  shopping_basket_id    serial,
  user_id               bigint  unsigned    unique    not null,
  total_price           double  unsigned              not null,

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
  total_price           double            unsigned    not null,

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

alter table d0018e_store.`order` alter total_price set default 0;

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
  description   varchar(300),

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

/*
------------------------------------------------------------------------
  insertion of data
------------------------------------------------------------------------
*/

insert into d0018e_store.user 
(first_name,  last_name,  email,                        password) VALUES 
('admin',     'admin',  'admin@d0018e.com', '$2b$10$YwyBdxMw9QhfKb3VpDG1jeuuA4AuCQBLuB8omOL3k0JAE5UULJ53G');

insert into d0018e_store.shopping_basket 
(user_id, total_price) values 
(1,       31.50);

insert into d0018e_store.subject 
(name) values 
('Matematik'), ('Programmering'), ('Fysik');

insert into d0018e_store.asset
(subject_id,  title,                        price,    amount,   description) values 
(1,           "matematik för nybörjare",    10.50,    3,        "matematik för alla åldrar!"),
(2,           "python för modiga",          69,       6,        "Boken för dig som vill va med och bekanta dig med ormar och andra vilda djur!"),
(2,           "algoritmer är vackra",    	119,	  16,        "Algoritmer som får dina knä å mjukna direkt. Rekommenderas varmt för dig som tycker om att inte förstå något överhuvudtaget. Vill du spendera resten av ditt liv på LTU så kör gärna på, den här boken lär egentligen inte behövas men den är iaf thiccc.");

insert into d0018e_store.shopping_basket_asset
(shopping_basket_id,  asset_id,   asset_amount,   when_added) values 
(1,                   1,          3,              now());

delimiter $$
/*
------------------------------------------------------------------------
  procedures
------------------------------------------------------------------------
*/

/*
example:

call d0018e_store.update_shopping_basket_total_price(1);

*/
create procedure d0018e_store.update_shopping_basket_total_price(
  in par_shopping_basket_id bigint
)
  begin
    declare var_total_price double;

    set var_total_price := (
      select sum(asset_amount*price)
      from shopping_basket_asset sa
      join asset a using (asset_id)
      where shopping_basket_id=par_shopping_basket_id
    );

    update shopping_basket set total_price=var_total_price where shopping_basket_id=par_shopping_basket_id;
    
  end $$

/*
example:

call d0018e_store.update_order_total_price(1);

*/
create procedure d0018e_store.update_order_total_price
(
  in par_order_id bigint
)
  begin
    declare var_total_price double;

    set var_total_price := (
      select sum(asset_amount*price) 
        from order_asset oa 
        join `order` o using (order_id) 
        join asset a using (asset_id) 
        where order_id=par_order_id
      );

    update `order` set total_price=var_total_price where order_id=par_order_id;
    
  end $$

/*
example:

call d0018e_store.add_user('jörgen', 'jansson', 'lol@asda.asda', '$2b$10$YwyBdxMw9QhfKb3VpDG1jeuuA4AuCQBLuB8omOL3k0JAE5UULJ53G');

*/
create procedure d0018e_store.add_user 
(
  in par_first_name varchar(15), 
  in par_last_name varchar(15),
  in par_email varchar(50),
  in par_password varchar(70)
)
  begin
    declare var_user_id bigint; 

    insert into `user` 
    (first_name,      last_name,      email,              password) values
    (par_first_name,  par_last_name,  lower(par_email),   par_password);

    select user_id into var_user_id from `user` where lower(email)=lower(par_email); 
    if var_user_id is not null then
      insert into shopping_basket (user_id, total_price) values (var_user_id, 0);
    else
      signal sqlstate '45000' set message_text = 'error: something went wrong while creating a user';
    end if;
	
  end $$
  

/*
example:

call d0018e_store.add_item_to_shopping_basket(1, 3, 'admin@d0018e.com');

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
	  declare var_shopping_basket_asset_id bigint;
	  declare var_store_asset_amount bigint;
    
    set var_user_id := (select user_id from `user` u where lower(email)=lower(par_email));
    set var_shopping_basket_id := (select shopping_basket_id from shopping_basket where user_id=var_user_id);
	  set var_shopping_basket_asset_id := (select shopping_basket_asset_id 
      from shopping_basket_asset sba
      join shopping_basket sb using (shopping_basket_id)
      join `user` u using (user_id)
      where sba.asset_id=par_asset_id and u.user_id=var_user_id and sb.shopping_basket_id=var_shopping_basket_id);
	  set var_store_asset_amount := (select amount from asset a where a.asset_id=par_asset_id);
  
    if (var_store_asset_amount < par_asset_amount) then
        signal sqlstate '45000' set message_text = 'error: insufficient amount of provided item';
    elseif (par_asset_amount <= 0) then
        signal sqlstate '45000' set message_text = 'error: the amount of items added to the shopping cart must be greater than zero';
    end if;

    if var_shopping_basket_asset_id is null then
	    insert into shopping_basket_asset 
		  (shopping_basket_id,      asset_id,       asset_amount,     when_added) values
		  (var_shopping_basket_id,  par_asset_id,   par_asset_amount, now());
    else
			update shopping_basket_asset
      set asset_amount=asset_amount+par_asset_amount
      where shopping_basket_asset_id=var_shopping_basket_asset_id;
	  end if;

    update asset set amount=amount-par_asset_amount where asset_id=par_asset_id; 
	
  end $$

/*
example:

call d0018e_store.create_order('admin@d0018e.com', @order_id);

*/
create procedure d0018e_store.create_order 
(
  in par_email varchar(50),
  out par_order_id bigint
)
  begin
    declare var_user_id bigint;
    declare var_shopping_basket_id bigint;
    declare var_order_id bigint;

    select u.user_id into var_user_id from `user` u where lower(email)=lower(par_email);
    
    select shopping_basket_id into var_shopping_basket_id from shopping_basket sb
    where sb.user_id=var_user_id; 

    if var_user_id is not null and var_shopping_basket_id is not null then
      insert into `order` 
      (user_id,       shopping_basket_id,       order_date) values
      (var_user_id,   var_shopping_basket_id,   now());
    
      set par_order_id := (select order_id from `order` o order by order_date desc limit 1);

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
    declare var_sba_amount bigint;
    declare var_user_id bigint;
    declare var_shopping_basket_id bigint;
    declare var_order_asset_id bigint;

    set var_user_id := (select user_id from `order` o where o.order_id=par_order_id);
    set var_shopping_basket_id := (select shopping_basket_id from shopping_basket where user_id=var_user_id);
    set var_sba_amount := (select asset_amount from shopping_basket_asset sa where sa.asset_id=par_asset_id and shopping_basket_id=var_shopping_basket_id);

    if var_sba_amount is null then
      signal sqlstate '45000' set message_text = 'error: item does not exist in the shopping basket';
    elseif (var_sba_amount < par_asset_amount) then
      signal sqlstate '45000' set message_text = 'error: insufficient amount of provided item in the shopping basket';
    elseif (par_asset_amount <= 0) then
      signal sqlstate '45000' set message_text = 'error: the amount of items added to the order must be greater than zero';
    elseif (var_sba_amount = par_asset_amount) then
      delete from shopping_basket_asset where asset_id=par_asset_id and shopping_basket_id=var_shopping_basket_id;
    else
      update shopping_basket_asset set asset_amount=asset_amount-par_asset_amount where asset_id=par_asset_id and shopping_basket_id=var_shopping_basket_id;
    end if;

    set var_order_asset_id := (select order_asset_id from order_asset where asset_id=par_asset_id and order_id=par_order_id);

    if var_order_asset_id is null then
      insert into order_asset
      (order_id,      asset_id,       asset_amount) values
      (par_order_id,  par_asset_id,   par_asset_amount);
    else
      update order_asset set asset_amount=asset_amount+par_asset_amount;
    end if;

  end $$

/*
example:

call d0018e_store.restore_sba_to_store('admin@d0018e.com', 1, 3);

*/
create procedure d0018e_store.restore_sba_to_store 
(
  in par_email      varchar(50),
  in par_asset_id   bigint,
  in par_asset_amount bigint
)
  begin
    declare var_user_id           bigint;
    declare var_sba_id            bigint;
    declare var_sba_asset_amount  bigint;

    set var_user_id := (select user_id from `user` u where lower(email)=lower(par_email));
    set var_sba_id := (select shopping_basket_asset_id from shopping_basket_asset sba
    join shopping_basket sb using (shopping_basket_id) 
    where user_id=var_user_id and asset_id=par_asset_id);
    set var_sba_asset_amount := (select asset_amount from shopping_basket_asset where shopping_basket_asset_id=var_sba_id);
    
    if var_sba_id is null then
      signal sqlstate '45000' set message_text = 'error: item does not exist in the shopping cart';
    elseif (par_asset_amount > var_sba_asset_amount) then
      signal sqlstate '45000' set message_text = 'error: the amount of the item in the shopping basket is lower than the amount attempted to be removed';
    elseif (par_asset_amount = var_sba_asset_amount) then
      delete from shopping_basket_asset where shopping_basket_asset_id=var_sba_id;
    else
      update shopping_basket_asset set asset_amount=asset_amount-par_asset_amount where shopping_basket_asset_id=var_sba_id;
    end if;

    update asset set amount=amount+par_asset_amount where asset_id=par_asset_id;
    
  end $$

/*
example:

call d0018e_store.add_comment_to_order_asset(1, 1, 5, "nice item");

*/
create procedure d0018e_store.add_comment_to_order_asset 
(
  in par_asset_id       bigint,
  in par_order_id       bigint,
  in par_rating         bigint,
  in par_comment_text   varchar(150)
)
  begin
    declare var_user_id           bigint;
    declare var_order_asset_id    bigint;

    set var_user_id := (select user_id from `order` where order_id=par_order_id);

    set var_order_asset_id := (select order_asset_id from order_asset 
      where order_id=par_order_id and asset_id=par_asset_id);

    insert into `comment` (user_id,       order_asset_id,       rating,       comment_text) values
                          (var_user_id,   var_order_asset_id,   par_rating,   par_comment_text);

  end $$


/*
------------------------------------------------------------------------
  triggers
------------------------------------------------------------------------
*/

create trigger d0018e_store.email_to_lower 
before insert on d0018e_store.`user` for each row
  begin
    set new.email := lower(new.email);
  end $$

create trigger d0018e_store.total_order_price_insert 
after insert on d0018e_store.order_asset for each row
    begin
      call d0018e_store.update_order_total_price(new.order_id);
    end $$

create trigger d0018e_store.total_order_price_update
after update on d0018e_store.order_asset for each row
    begin
      call d0018e_store.update_order_total_price(old.order_id);
    end $$

create trigger d0018e_store.total_shopping_basket_price_insert
after insert on d0018e_store.shopping_basket_asset for each row
    begin
      call d0018e_store.update_shopping_basket_total_price(new.shopping_basket_id);
    end $$

create trigger d0018e_store.total_shopping_basket_price_update
after update on d0018e_store.shopping_basket_asset for each row
    begin
      call d0018e_store.update_shopping_basket_total_price(old.shopping_basket_id);
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
        delete from d0018e_store.shopping_basket_asset 
        where shopping_basket_asset_id 
        in 
        (select shopping_basket_asset_id 
          from shopping_basket_asset 
          where when_added < date_sub(now(), interval 30 minute));

/*
------------------------------------------------------------------------
  views
------------------------------------------------------------------------
*/

/* create view d0018e_store.order_info as select asset_id, order_id, order_asset_id, asset_amount, user_id, shopping_basket_id, order_date, subject_id, title, price, description, asset_amount*price total_order_asset_price from order_asset oa join `order` o using (order_id) join asset a using (asset_id);
*/