/*///////////////////////////////////////////////////////////////////////////////
var:1.0 2024-07-05 新規作成
var:1.1 2024-08-21 csvdatas checkqty追加
var:1.2 2025-05-30 modellistにaddress追加
///////////////////////////////////////////////////////////////////////////////*/

console.log("ver: 1.2")

////////////////////////////////////////////////////////////////////////////////
//
//                                MongoDB構成
//
////////////////////////////////////////////////////////////////////////////////

console.log("factory2_mongo version:1.1")

var mongoose = require('mongoose');
mongoose.Promise = Promise;
//localhostのnode_memo_demoのデータベースに接続。
var db = mongoose.connect('mongodb://localhost/factory2');
//メモのスキーマを宣言。
//require('mongoose-currency').loadType(mongoose);
//var Currency = mongoose.Types.Currency;

require('mongoose-double')(mongoose);
//メモのスキーマを宣言。
var SchemaTypes = mongoose.Schema.Types;

var ModelSchema = new mongoose.Schema(
  {
    _id:        { type: String, required: true },
    modelid:    { type: Number, min: 0, default: 0 },
    modelname:  { type: String },
    typename:   { type: String },
    pin:        { type: Number, min: 0, default: 0 },
    address:    { type: String },  
    maxqty:     { type: Number, min: 0, default: 0 },
  }
);

var modellist = mongoose.model('modellists', ModelSchema);

var LotSchema = new mongoose.Schema(
  {
    _id:        { type: String, required: true },
    modelid:    { type: String },
    modelname:  { type: String },
    workerid:   { type: Number, min: 0, default: 0 },
    workername: { type: String },
    oldid:      { type: String },
    qty:        { type: Number, min: 0, default: 0 }, 
    lot:        { type: String },  
    stock:      { type: Number, min: 0, default: 0 }, 
    use:        { type: Number, min: 0, default: 0 },
    lotend:     { type: Number, min: 0, default: 0 },
    daystr:     { type: String },
    moisture:   { type: Number, min: 0, default: 0 }
  }
);

var lotlist = mongoose.model('lotlists', LotSchema);

var LotLogSchema = new mongoose.Schema(
  {
    _id:        { type: String, required: true },
    lotid:      { type: String, required: true },
    ornerid:    { type: String, required: true },
    update_time:{ type: String },
    daystr:     { type: String },
    listid:     { type: String },
    modelid:    { type: Number, min: 0, default: 0 },
    modelname:  { type: String },
    modename:   { type: String },
    mode:       { type: Number, min: 0, default: 0 },
    workerid:   { type: Number, min: 0, default: 0 },
    workername: { type: String },
    status:     { type: Number, min: 0, default: 0 },
    qty:        { type: Number, min: 0, default: 0 },
    ip:         { type: String },  
    timeno:     { type: Number, min: 0, default: 0 },
    starttime:  { type: String }, 
    finishtime: { type: String }, 
    lot:        { type: String },  
  }
);

var lotlog = mongoose.model('lotlogs', LotLogSchema);

var SettingSchema = new mongoose.Schema(
  {
    _id:        { type: String, required: true },
    value:      { type: Number, min: 0, default: 0 },
    text:       { type: String }, 
  }
);
var setting = mongoose.model('settings', SettingSchema);

var LotStockSchema = new mongoose.Schema(
  {
    _id:        { type: String, required: true },
    month:      { type: String, required: true },
    ornerid:    { type: String, required: true },
    stock:      { type: Number, min: 0, default: 0 },
    status:     { type: Number, min: 0, default: 0 },
    moisture:   { type: Number, min: 0, default: 0 },
    info:       {},
  }
);
var lotstock = mongoose.model('lotstocks', LotStockSchema);

var CsvDataSchema = new mongoose.Schema(
  {
    _id:        { type: String, required: true },
    modelid:    { type: String, required: false },
    modelname:  { type: String, required: false },
    qty:        { type: Number, min: 0, default: 0 },
    date:       { type: String, required: false },
    update_time:{ type: String, required: false },
    checkqty:   { type: Number, min: 0, default: 0 },
    shipmentqty:{ type: Number, min: 0, default: 0 },    
    price:      { type: SchemaTypes.Double },   
    destination:{ type: String, required: false },
    plancount:  { type: Number, min: 0, default: 0 },
    endplan:    {type: Boolean, default: false },
    disable:    {type: Boolean, default: false },
    makeinstruct: {type: Boolean, default: false },  
    makeinstruct2: {type: Boolean, default: false },   
    makeinstruct3: {type: Boolean, default: false },  
    checkflg:   {type: Boolean, default: false },   
  }
);
var csvdata = mongoose.model('csvdatas', CsvDataSchema);

var CheckSchema = new mongoose.Schema(
  {
    _id:             { type: String, required: true },
    modelname:       { type: String, required: true },
    qty:             { type: Number, min: 0, default: 0 }, 
    case_count:      { type: Number, min: 0, default: 0 }, 
    nukitori:        { type: Number, min: 0, default: 0 },
    daisu:           { type: Number, min: 0, default: 0 },  
    ngcode:          [],
    lotno:           { type: Number, min: 0, default: 0 }, 
    order_no:        { type: Number, min: 0, default: 0 }, 
    ngjudgment:      { type: Number, min: 0, default: 0 }, 
    ngmethod:        { type: Number, min: 0, default: 0 },  
    workday:         { type: String, required: false },
    production:      { type: Number, min: 0, default: 0 },  
    comment:         { type: String, required: false },
    workerid:        { type: Number, min: 0, default: 0 },
    lot_count:       { type: Number, min: 0, default: 0 },
    total_lot_count: { type: Number, min: 0, default: 0 },   
    current_lot:     { type: Number, min: 0, default: 0 },  
    lot_info:        { type: Number, min: 0, default: 0 },  
    nukitori:        { type: Number, min: 0, default: 0 },   
    workname:        { type: String, required: false },
    daystr:          { type: String, required: false },  
    ipaddress:       { type: String, required: false }, 
    checklist:       []
  }    
);  

var CheckReport = mongoose.model('checkreports',CheckSchema);
var ShipmentReport = mongoose.model('shipmentreports',CheckSchema);

var InventSchema = new mongoose.Schema(
  {
    _id:        { type: String, required: true },
    daystr:     { type: String, required: true },
    update_time:{ type: String, required: true },
    qty:        { type: Number, min: 0, default: 0 },
    modelid:    { type: String },
    modelname:  { type: String },
    workerid:   { type: Number, min: 0, default: 0 },
    workername: { type: String },
    posid:      { type: String },
    ip:         { type: String },    
  }
);
var inventlog = mongoose.model('inventlogs', InventSchema);

var McPlanSchema = new mongoose.Schema(
  {
    _id:        { type: String, required: true },
    modeltype:  { type: String, required: true },
    csvdataid:  { type: String, required: true },
    comment:    { type: String, required: false },  
    update_time:{ type: String, required: false },   
    pice:       { type: Number, min: 0, default: 0 },
    qty:        { type: Number, min: 0, default: 0 },
    product:    { type: Number, min: 0, default: 0 },  
    modelid:    { type: Number, min: 0, default: 0 }, 
    modelname:  { type: String, required: true },   
    daymaxcount:{ type: SchemaTypes.Double },    
    startday:   { type: String, required: false }, 
    addtime:    { type: String, required: false }, 
    starttime:  { type: String, required: false },  
    endtime:    { type: String, required: false },   
    worktime:   { type: SchemaTypes.Double }, 
    price:      { type: SchemaTypes.Double },  
    settingtime:{ type: SchemaTypes.Double }, 
    sortno:     { type: Number, min: 0, default: 0 }, 
    shipment:   { type: String, required: false }, 
    endplan:    {type: Boolean, default: false },  
    plandata:   [],  
    column:     []    
  }
);
var mcplan = mongoose.model('mcplans', McPlanSchema);

var McTaskSchema = new mongoose.Schema(
  {
    _id:        { type: String, required: true },
  //  modeltype:  { type: String, required: true },
    ornerid:    { type: String, required: true },
  //  comment:    { type: String, required: false }, 
    workday:    { type: String, required: true },  
    plan:       { type: Number, min: 0, default: 0 } ,
    product:    { type: Number, min: 0, default: 0 } ,
    tasklist: []
  //  worktime:   { type: SchemaTypes.Double }, 
  //  settingtime:{ type: SchemaTypes.Double },
  //  no:         { type: Number, min: 0, default: 0 },  
  //  lock:       { type: String, required: false },     
  }
);
var mctask = mongoose.model('mctasks', McTaskSchema);

var McGridSchema = new mongoose.Schema(
  {
    _id:        { type: String, required: true },
    modeltype:  { type: String, required: true },
    ornerid:    { type: String, required: true },   
    comment:    { type: String, required: false }, 
    workday:    { type: String, required: false },  
    plan:       { type: Number, min: 0, default: 0 } ,
    product:    { type: Number, min: 0, default: 0 } ,
    worktime:   { type: SchemaTypes.Double }, 
    settingtime:{ type: SchemaTypes.Double },
    lock:       { type: Number, min: 0, default: 0 },   
    no:         { type: Number, min: 0, default: 0 },     
  }
);
var mcgrid = mongoose.model('mcgrids', McGridSchema);

var McNameSchema = new mongoose.Schema({
  _id:           { type: String, required: true },
  modeltype:     { type: String, required: true },
  worktime:      { type: SchemaTypes.Double }, 
})

var holidaySchema = new mongoose.Schema({
  _id:           { type: String, required: true },
  month:         { type: String, required: false },
  daystr:        { type: String, required: false }, 
  title:         { type: String, required: false },
  weekname:      { type: String, required: true },
  status:        { type: Number, min: 0, default: 0 },
  worktime:      { type: SchemaTypes.Double }, 
  mcnames:       [McNameSchema]
})

var holidays = mongoose.model('holidaydatas', holidaySchema);

var daylistSchema = new mongoose.Schema({
  _id:           { type: String, required: true },
  modeltype:     { type: String, required: false },
  daystr:        { type: String, required: false }, 
  status:        { type: Number, min: 0, default: 0 },
  worktime:      { type: SchemaTypes.Double },  
})

var mcdays = mongoose.model('daylists', daylistSchema);

var McSpecSchema = new mongoose.Schema({
  _id:           { type: String, required: true },
  type:          { type: String, required: false },
  modeltype:     { type: String, required: false }, 
  mccode:        { type: String, required: false },
  filter1:       { type: String, required: false },
  spm:           { type: Number, min: 0, default: 0 }, 
  rate:          { type: Number, min: 0, default: 0 }, 
  pin:           { type: Number, min: 0, default: 0 }, 
  pintype:       { type: Number, min: 0, default: 0 }, 
  ordernum:      { type: Number, min: 0, default: 0 }, 
  pice:          { type: Number, min: 0, default: 0 }, 
  lotpice:       { type: Number, min: 0, default: 0 },
  boxpice:       { type: Number, min: 0, default: 0 }  
})

var mcspec = mongoose.model('specdatas', McSpecSchema);

var mctimelineSchema = new mongoose.Schema({
  _id:           { type: String, required: true },
  daystr:        { type: String, required: false },
  day:           { type: Number, min: 0, default: 0 },
  timestr:       { type: String, required: false }, 
  status:        { type: Number, min: 0, default: 0 },
  plan:          { type: SchemaTypes.Double }, 
  product:       { type: SchemaTypes.Double },   
})

var mctimeline = mongoose.model('mctimelines', mctimelineSchema);

var PartListSchema = new mongoose.Schema({
  _id:           { type: String, required: true },
  modelname:     { type: String, required: false },
  partlist:      [],
})

var partlist = mongoose.model('partlists', PartListSchema);

var PartCheckSchema = new mongoose.Schema({
  _id:           { type: String, required: true },
  modelid:       { type: String, required: true },
  modelname:     { type: String, required: true }, 
  orderid:       { type: String, required: false },
  targetmodel:   { type: String, required: false },
  partid:        { type: String, required: false }, 
  status:        { type: Number, min: 0, default: 0 },
  workerid:      { type: Number, min: 0, default: 0 },
  workername:    { type: String, required: false },
  update_time:   { type: String, required: false },  
})

var partcheck = mongoose.model('partchecks', PartCheckSchema);

var timesSchema = new mongoose.Schema(
  {
     _id:        { type: String, required: true },
     timestr:     { type: String, required: true },
     flg    :     { type: Number, default: 0 },
     shift:     { type: Number, default: 0 },
     shiftstr:   { type: String, required: true },
     sortno:     { type: Number, default: 0 },
  }
);

var btimes = mongoose.model('breaktimes',timesSchema);

var orderlistSchema = new mongoose.Schema(
  {
     _id:        { type: String, required: true }, //生産No-枝番
     shipment:   { type: String, required: true }, //出荷日
     request:    { type: String, required: false },//回答納期
     destination:{ type: String, required: false },//出荷先
     modelid:    { type: Number, default: 0 },     //品番
     modelname:  { type: String, required: true }, //品名
     qty:        { type: Number, default: 0 },     //出荷数
     restqty:    { type: Number, default: 0 },     //残り
     orderno:    { type: String, required: true }, //オーダーNo
     no:         { type: Number, default: 0 },     //枝番
     comment:    { type: String, required: false },//備考
  }
);

var orderlist = mongoose.model('orderlists',orderlistSchema);

module.exports = {
  modellist,
  lotlist,
  lotlog,
  setting,
  lotstock,
  csvdata,
  CheckReport,
  inventlog,
  ShipmentReport,
  mcplan,
  mctask,
  holidays,
  mcspec,
  mcdays,
  mctimeline,
  mcgrid,
  partlist,
  partcheck,
  btimes,
  orderlist
}
