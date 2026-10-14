// Restored from the dissertation and the retained case-study evidence table.
// Venue order is Beer Hall, Two River Taps, Ellel throughout.
export const evidence={
 stages:[
  {name:'Ingest',title:'Build the evidence base.',body:'I assembled source exports into a local warehouse and fixed its ceiling so rolling evaluations could be reproduced. Three trading venues supplied 399, 386 and 331-day frames.',decision:'Only sales reached rhythm modelling. Stock and checklist paths were built and exercised with stand-in data; the 735 chat messages informed knowledge gaps.'},
  {name:'Prepare',title:'Make the calendar and the history explicit.',body:'Daily takings were assembled on a venue calendar, with trading days distinguished from structural closures. Lagged and rolling revenue features use observations strictly earlier than the row being forecast.',decision:'The booking-led venue needs a booking diary. A weekday calendar can describe a routine, but cannot recover missing event information or turn sales into an independent occurrence signal.'},
  {name:'Forecast',title:'Give the complex model a fair baseline.',body:'Ten models were compared across five rungs, from seasonal naive and weekday median to fitted statistical models, gradient boosting and pretrained time-series models. One-day rolling origins supplied 273, 205 and 260 comparisons.',decision:'Keep the served model distinct from the lowest sample mean. The 90% model confidence sets retain six, four and seven models, so the available evidence does not establish a single superior replacement.'},
  {name:'Calibrate',title:'Turn a forecast into a testable promise.',body:'Held-out absolute errors set conformal half-widths. The served Mondrian band separates calendar-open and structurally closed days; its coverage is audited again on the days the venue actually traded.',decision:'An estate-wide average can hide the wrong promise. At Ellel, 91.3% all-pair coverage coexists with 69.2% trading-day coverage. Fix the calibration population and validate prospectively before changing the product.'},
  {name:'Detect & triage',title:'Decide what deserves the interruption.',body:'Point breaches are scanned over the last 14 trading days. CUSUM and four-of-seven persistence identify sustained departures; the incumbent ranks candidate briefings and an offline LLM challenger re-ranks that queue.',decision:'Separate detection from explanation, and rank changes from operator value. The LLM comparison established no clear advantage; the price of a miss and an unwanted interruption still needs to come from the manager.'}
 ],
 venues:[
  {name:'Beer Hall',served:8,origins:273,mcs:6,all:.870,traded:.892,tradingPairs:1229,falseOpen:21,falseCoverage:.381,closed:500,closedCoverage:.838,insight:'Trading-day coverage is 89.2%, close to the 90% target. The 21 calendar-open pairs with no trade cover only 38.1%; the calendar grouping still needs its limits kept visible.'},
  {name:'Two River Taps',served:2,origins:205,mcs:4,all:.962,traded:.963,tradingPairs:903,falseOpen:7,falseCoverage:.571,closed:364,closedCoverage:.964,insight:'Trading-day coverage is 96.3%, above the 90% target. A shrinking residual scale during the venue’s wind-down leaves the earlier calibrated band conservative; overcoverage is not a reason to ignore interval width.'},
  {name:'Ellel',served:1,origins:260,mcs:7,all:.913,traded:.692,tradingPairs:240,falseOpen:945,falseCoverage:.983,closed:474,closedCoverage:.884,insight:'The calendar called 945 non-trading pairs open. Their 98.3% coverage masks a 69.2% result when the venue actually traded. Capture bookings before promising a reliable band.'}
 ],
 models:[
  {id:0,rung:0,name:'seasonal naive',values:[[.7329,.7678],[.5423,.6684],[333.6,159.1]],retained:[false,false,false],served:[false,false,false]},
  {id:1,rung:1,name:'robust day-of-week median',values:[[.6189,.6578],[.5574,.7805],[240.2,107.6]],retained:[true,false,true],served:[false,false,true]},
  {id:2,rung:2,name:'exponential smoothing',values:[[.5795,.6159],[.4924,.6051],[272.0,133.9]],retained:[true,true,true],served:[false,true,false]},
  {id:3,rung:2,name:'seasonal-trend decomposition',values:[[.6333,.7130],[.5434,.7285],[262.0,135.3]],retained:[false,false,true],served:[false,false,false]},
  {id:4,rung:2,name:'Prophet',values:[[.5737,.6037],[.5318,.6896],[268.2,126.9]],retained:[true,false,true],served:[false,false,false]},
  {id:5,rung:3,name:'histogram gradient boosting',values:[[.6563,.7230],[.5258,.6931],[296.8,168.5]],retained:[false,false,false],served:[false,false,false]},
  {id:6,rung:3,name:'global gradient boosting',values:[[.6400,.7081],[.6818,.8338],[294.8,169.1]],retained:[false,false,false],served:[false,false,false]},
  {id:7,rung:4,name:'Chronos-2, univariate',values:[[.5848,.6005],[.4614,.6260],[242.3,110.9]],retained:[true,true,true],served:[false,false,false]},
  {id:8,rung:4,name:'Chronos-2, exogenous',values:[[.5681,.5862],[.4630,.6261],[240.6,110.8]],retained:[true,true,true],served:[true,false,false]},
  {id:9,rung:4,name:'Chronos-Bolt, univariate',values:[[.5680,.5991],[.4652,.6150],[238.2,106.0]],retained:[true,true,true],served:[false,false,false]}
 ],
 events:[
  {name:'All events',caught:520,missed:40,unexamined:84},
  {name:'Spike',caught:165,missed:39,unexamined:84},
  {name:'Regime shift',caught:251,missed:1,unexamined:0},
  {name:'Weather-linked',caught:84,missed:0,unexamined:0},
  {name:'Stock drawdown',caught:20,missed:0,unexamined:0}
 ],
 triage:[
  {name:'All scenarios',records:1593,items:159,incumbent:.878,agent:.881,difference:.003,ci:[-.069,.060]},
  {name:'Regime shift',records:606,items:116,incumbent:.983,agent:.986,difference:.003,ci:[-.028,.021]},
  {name:'Weather-linked',records:206,items:71,incumbent:.959,agent:.977,difference:.018,ci:[-.040,.059]},
  {name:'Spike',records:711,items:48,incumbent:.671,agent:.612,difference:-.059,ci:[-.211,.071]},
  {name:'Stock drawdown',records:70,items:11,incumbent:1,agent:1,difference:0,ci:null}
 ]
};
