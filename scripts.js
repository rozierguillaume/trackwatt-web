
var data;

const config = {
  displayModeBar: false,
  responsive: true
};

const layout = {
  shapes: [],
  xaxis: {fixedrange: true},
  yaxis: {fixedrange: true},
  plot_bgcolor:"rgba(0,0,0,0)",
  paper_bgcolor:"rgba(0,0,0,0)",
  hoverlabel: {
    bgcolor: "white",
    bordercolor: "rgba(0,0,0,0)",
    font: {
      color: "black"
    }
  },
  margin: {
    l: 35,
    r: 20,
    b: 50,
    t: 50,
    pad: 4,
  },
};

function get_str_level_and_color_from_power_consumption(power_consumption){
  if (power_consumption > 90000){
    return ["TRÈS ÉLEVÉE", "purple"]
  }

  if (power_consumption > 75000){
    return ["ÉLEVÉE", "red"]
  }

  if (power_consumption > 55000){
    return ["MODÉRÉE", "orange"]
  }

  if (power_consumption > 45000){
    return ["ASSEZ BASSE", "darkgreen"]
  }

  if (power_consumption > 35000){
    return ["BASSE", "green"]
  }

  return ["TRÈS BASSE", "green"]
}


function update_data_instant_power(data){
  consommation_instantanee = data.consumption_realised.at(0)

  instant_power_status = "-"
  instant_power_color = "black"

  str_level_power_consumption = get_str_level_and_color_from_power_consumption(consommation_instantanee)

  instant_power_level_evolution = "";
  if (data.consumption_realised.at(0) > data.consumption_realised.at(4)){
    instant_power_level_evolution = "EN HAUSSE &uarr;"
    instant_power_evolution_color = "red"
  }

  if (data.consumption_realised.at(0) < data.consumption_realised.at(4)){
    instant_power_level_evolution = "EN BAISSE &darr;"
    instant_power_evolution_color = "darkgreen"
  }

  this.document.getElementById("instant_power_datetime").innerHTML = "en moyenne entre " + moment(data.datetime.at(1)).locale("FR").format('LT') + " et " + moment(data.datetime.at(0)).locale("FR").format('LT');
  this.document.getElementById("instant_power").innerHTML = (consommation_instantanee).toLocaleString("FR");
  this.document.getElementById("instant_power_level").innerHTML = str_level_power_consumption[0];
  this.document.getElementById("instant_power_level").style["color"] = str_level_power_consumption[1];

  this.document.getElementById("instant_power_level_evolution").innerHTML = instant_power_level_evolution;
  this.document.getElementById("instant_power_level_evolution").style["color"] = instant_power_evolution_color;
  
}

function update_text_current_month_energy_consumption(data_current, data_mean){
  pourcent = ((data_current.cumsum.at(1) - data_mean.energy_consumption_cumsum.at(data_current.cumsum.length-2) ) / data_mean.energy_consumption_cumsum.at(data_current.cumsum.length-2) * 100).toFixed(1)
  prefix=""
  if (pourcent>0){
    prefix = "+"
    this.document.getElementById("inner_card_current_month_energy_consumption_evolution").style["background-color"] = "rgb(255, 217, 217)"
  }
  this.document.getElementById("current_month_energy_consumption_evolution").innerHTML = prefix + " " + pourcent;
  this.document.getElementById("current_month_energy_consumption_evolution_day").innerHTML = new Date(data_current.day.at(-1)).toLocaleDateString() + " au " + new Date(data_current.day.at(1)).toLocaleDateString();
}

function update_text_forecast_d_1(data_forecast){
  str_level_and_color = get_str_level_and_color_from_power_consumption(data_forecast["consumption_forecast"]);
  this.document.getElementById("max_forecast_d_1").innerHTML = data_forecast["consumption_forecast"].toLocaleString();
  this.document.getElementById("max_forecast_d_1_date").innerHTML = moment(data_forecast["datetime"]).locale("FR").format("DD MMM à H:mm");
  this.document.getElementById("max_forecast_d_1_level").innerHTML = str_level_and_color[0];
  this.document.getElementById("max_forecast_d_1_level").style["color"] = str_level_and_color[1];
}

function update_text_forecast_d_2(data_forecast){
  str_level_and_color = get_str_level_and_color_from_power_consumption(data_forecast["consumption_forecast"]);
  this.document.getElementById("max_forecast_d_2").innerHTML = data_forecast["consumption_forecast"].toLocaleString();
  this.document.getElementById("max_forecast_d_2_date").innerHTML = moment(data_forecast["datetime"]).locale("FR").format("DD MMM à H:mm");
  this.document.getElementById("max_forecast_d_2_level").innerHTML = str_level_and_color[0];
  this.document.getElementById("max_forecast_d_2_level").style["color"] = str_level_and_color[1];
}

function chart_consumption_short_term(data, data_forecast, show_maximum=false){
  chart_layout = { ...layout };
  chart_layout["annotations"] = [{
      xref: 'paper',
      yref: 'paper',
      x: 0.5,
      xanchor: 'middle',
      y: 1,
      yanchor: 'bottom',
      text: 'Max observé en hiver',
      font: {color: 'rgba(255, 0, 0, 0.7)', size: 10},
      showarrow: false
    },
    {
      xref: 'x',
      yref: 'y',
      x: data.datetime.at(0),
      xanchor: 'right',
      y: data.consumption_realised.at(0),
      yanchor: 'bottom',
      text:  data.consumption_realised.at(0).toLocaleString("FR") + ' MW<br>consommés actu.',
      showarrow: true,
      arrowhead: 4,
      yshift: 3,
      ax: 0,
      font: {color: "rgb(0, 0, 0)"}
    },]
    

  if (show_maximum == false) {
    chart_layout["shapes"].push(
        {
            type: 'line',
            xref: 'paper',
            x0: 0,
            y0: 87000,
            x1: 1,
            y1: 87000,
            line:{
                color: 'rgb(255, 0, 0)',
                width: 1,
                dash:'dot'
            }
        },
    )
  }
         

  chart_layout["yaxis"] = {
    title: "Puissance électrique (MW)",
    automargin: true,
    fixedrange: true,
    showspikes: true,
    spikemode: "across",
    spikesnap:"cursor",
    spikecolor: "black",
    spikethickness: 2
  }

  chart_layout["xaxis"]["showspikes"] = true
  chart_layout["xaxis"]["spikemode"] = "across"
  chart_layout["xaxis"]["spikesnap"] = "cursor"
  chart_layout["xaxis"]["spikecolor"] = "black"
  chart_layout["xaxis"]["spikethickness"] = 2

  var data_chart = [
    {
      x: data.datetime,
      y: data.consumption_realised,
      type: 'line',
      fill: 'tozeroy',
      hovertemplate: "<br>" + "%{x}<br>" + "Puiss. consommée : <b>%{y:}</b> MW<br>" + "<extra></extra>",
      name: "Puissance mesurée",
      line: {
        color: 'rgb(52, 142, 194)', //rouge: 219, 64, 82 vert: 52, 173, 107 bleu: 52, 169, 173
        width: 5
      }
    },
    {
      x: data_forecast.datetime,
      y: data_forecast.consumption_forecast,
      type: 'line',
      hovertemplate: "<br>" + "%{x}<br>" + "Prévision J-1 puiss. : <b>%{y:}</b> MW<br>" + "<extra></extra>",
      name: "Prévision",
      line: {
        color: 'rgba(52, 142, 194, 0.7)',
        dash: 'dot',
        width: 3
      }
    },
  ];

  chart_layout["legend"] = {"orientation": "h"}

  Plotly.newPlot('consumptionShortTerm', data_chart, chart_layout, config);
}

function chart_current_month_energy_consumption(data_current, data_daily, show_maximum=false){
  chart_layout = { ...layout };
  
  chart_layout["shapes"] = []

  chart_layout["yaxis"] = {
    title: "Énergie consommée depuis le 1er du mois (MWh)",
    automargin: true,
    fixedrange: true,
    showspikes: true,
    spikemode: "across",
    spikesnap:"cursor",
    spikecolor: "black",
    spikethickness: 2
  }

  chart_layout["legend"] = {"orientation": "h"}

  chart_layout["xaxis"]["showspikes"] = true
  chart_layout["xaxis"]["spikemode"] = "across"
  chart_layout["xaxis"]["spikesnap"] = "cursor"
  chart_layout["xaxis"]["spikecolor"] = "black"
  chart_layout["xaxis"]["spikethickness"] = 2
  chart_layout["xaxis"]["range"] = [data_current.day.at(-2), data_current.day.at(0)]
  chart_layout["xaxis"]["tickformat"]="%d/%m"
  chart_layout["xaxis"]["ticklabelmode"]="instant"
  
  var data_chart = [
    {
      x: data_daily.day.slice(0, data_current.cumsum.length-1),
      y: data_daily.energy_consumption_cumsum.slice(0, data_current.cumsum.length-1),
      type: 'markers',
      name: "Années précédentes",
      hovertemplate: "<br>" + "%{x}<br>" + "Énergie consommée hab. : <b>%{y:}</b> MWh<br>" + "<extra></extra>",
      
      line: {
        color: 'rgba(0, 0, 0, 0.9)', //rouge: 219, 64, 82 vert: 52, 173, 107 bleu: 52, 169, 173
        width: 3,
        dash: "dot"
      },
      marker: {
        size: 5
      }
    },
    {
      x: data_current.day.slice(1, data_current.day.length),
      y: data_current.cumsum.slice(1, data_current.cumsum.length),
      type: 'line+markers',
      name: 'Octobre 2022',
      hovertemplate: "<br>" + "%{x}<br>" + "Énergie consommée 2022 : <b>%{y:}</b> MWh<br>" + "<extra></extra>",
      line: {
        color: 'rgb(52, 142, 194)', //rouge: 219, 64, 82 vert: 52, 173, 107 bleu: 52, 169, 173
        width: 5
      },
      marker: {
        size: 10
      }
    }
  ];

  Plotly.newPlot('currentMonthEnergyConsumption', data_chart, chart_layout, config);
}

function chart_consumption_max_daily(data){
  chart_layout = { ...layout };
  chart_layout["yaxis"] = {
    title: "Puissance électrique (MW)",
    automargin: true,
    fixedrange: true,
    showspikes: true
  }

  chart_layout["shapes"] = [];

  chart_layout["annotations"] = [{
      xref: 'x',
      yref: 'y',
      x: data.month.at(0),
      xanchor: 'right',
      y: data.max_monthly_power_consumption.at(0),
      yanchor: 'bottom',
      text:  data.max_monthly_power_consumption.at(0).toLocaleString("FR") + ' MW max sur<br>le mois actuel',
      showarrow: true,
      arrowhead: 4,
      yshift: 2,
      ax:0,
      ay: -125,
      align: "right",
      font: {color: "rgb(0, 0, 0)"},
    },]

  var data_chart = [
    {
      x: data.month,
      y: data.max_monthly_power_consumption,
      type: 'bar',
      fill: 'tozeroy',
      hovertemplate: "<br>" + "%{x}<br>" + "Puiss. consommée : <b>%{y:}</b> MW<br>" + "<extra></extra>",
      line: {
        color: 'rgb(219, 64, 82)',
        width: 5
      }
    }
  ];
  

  Plotly.newPlot('consumptionMaxDaily', data_chart, chart_layout, config);
}

function main(){
  fetch('https://storage.sbg.cloud.ovh.net/v1/AUTH_52abbf42f96c4960876d50d2965bb9af/trackwatt-data/energy_consumption_short_term.json', {cache: "no-store"})
  .then(response => response.json())
  .then(data => {
    update_data_instant_power(data)
    fetch_forecast_d0(data)
    }
  );

  function fetch_forecast_d0(data){
    fetch('https://storage.sbg.cloud.ovh.net/v1/AUTH_52abbf42f96c4960876d50d2965bb9af/trackwatt-data/forecast_consumption_d0.json', {cache: "no-store"})
    .then(response => response.json())
    .then(data_forecast => {
      chart_consumption_short_term(data, data_forecast);
      }
    );
  }

  fetch('https://storage.sbg.cloud.ovh.net/v1/AUTH_52abbf42f96c4960876d50d2965bb9af/trackwatt-data/energy_consumption_max_monthly.json', {cache: "no-store"})
    .then(response => response.json())
    .then(data => {
      chart_consumption_max_daily(data);
      
    }
  );

  fetch('https://storage.sbg.cloud.ovh.net/v1/AUTH_52abbf42f96c4960876d50d2965bb9af/trackwatt-data/current_month_energy_consumption.json', {cache: "no-store"})
    .then(response => response.json())
    .then(data => {
      fetch_mean_daily_energy_consumption(data)
    }
  );

  fetch('https://storage.sbg.cloud.ovh.net/v1/AUTH_52abbf42f96c4960876d50d2965bb9af/trackwatt-data/max_forecast_consumption_d1.json', {cache: "no-store"})
      .then(response => response.json())
      .then(data => {
        update_text_forecast_d_1(data)
      }
  );

  fetch('https://storage.sbg.cloud.ovh.net/v1/AUTH_52abbf42f96c4960876d50d2965bb9af/trackwatt-data/max_forecast_consumption_d2.json', {cache: "no-store"})
      .then(response => response.json())
      .then(data => {
        update_text_forecast_d_2(data)
      }
  );
  

  /*
  function fetch_mean_daily_energy_consumption(data_current){
    fetch('https://storage.sbg.cloud.ovh.net/v1/AUTH_52abbf42f96c4960876d50d2965bb9af/trackwatt-data/mean_daily_energy_consumption.json', {cache: "no-store"})
      .then(response => response.json())
      .then(data_daily => {
        chart_current_month_energy_consumption(data_current, data_daily)
        update_text_current_month_energy_consumption(data_current, data_daily)
      }
    );
  }
  */
  }


main();

setInterval(function() {
    main();
}, 15 * 60 * 1000);
