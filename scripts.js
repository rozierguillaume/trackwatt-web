
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


function update_data_instant_power(data){
  consommation_instantanee = data.consumption_realised.at(0)

  instant_power_status = "-"
  instant_power_color = "black"

  if (data.consumption_realised.at(0) > 0){
    instant_power_level = "TRÈS BASSE"
    instant_power_color = "green"
  }

  if (data.consumption_realised.at(0) > 35000){
    instant_power_level = "BASSE"
    instant_power_color = "green"
  }

  if (data.consumption_realised.at(0) > 45000){
    instant_power_level = "ASSEZ BASSE"
    instant_power_color = "darkgreen"
  }

  if (data.consumption_realised.at(0) > 55000){
    instant_power_level = "MODÉRÉE"
    instant_power_color = "orange"
  }

  if (data.consumption_realised.at(0) > 75000){
    instant_power_level = "ÉLEVÉE"
    instant_power_color = "red"
  }

  if (data.consumption_realised.at(0) > 90000){
    instant_power_level = "TRÈS ÉLEVÉE"
    instant_power_color = "purple"
  }

  instant_power_level_evolution = "";
  if (data.consumption_realised.at(0) > data.consumption_realised.at(4)){
    instant_power_level_evolution = "&uarr;"
  }

  if (data.consumption_realised.at(0) < data.consumption_realised.at(4)){
    instant_power_level_evolution = "&darr;"
  }

  this.document.getElementById("instant_power_datetime").innerHTML = "en moyenne entre " + moment(data.datetime.at(1)).locale("FR").format('LT') + " et " + moment(data.datetime.at(0)).locale("FR").format('LT');
  this.document.getElementById("instant_power").innerHTML = (consommation_instantanee).toLocaleString("FR");
  this.document.getElementById("instant_power_level").innerHTML = instant_power_level + " " + instant_power_level_evolution;
  this.document.getElementById("instant_power_level").style["color"] = instant_power_color;
  
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

function chart_consumption_short_term(data, show_maximum=false){
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

      line: {
        color: 'rgb(52, 142, 194)', //rouge: 219, 64, 82 vert: 52, 173, 107 bleu: 52, 169, 173
        width: 5
      }
    }
  ];

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
      yshift: 0,
      ax:0,
      font: {color: "rgb(0, 0, 0)"}
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
    chart_consumption_short_term(data)
    update_data_instant_power(data)
  }
    );

  fetch('https://storage.sbg.cloud.ovh.net/v1/AUTH_52abbf42f96c4960876d50d2965bb9af/trackwatt-data/energy_consumption_max_monthly.json', {cache: "no-store"})
    .then(response => response.json())
    .then(data => {
      chart_consumption_max_daily(data)
    }
      );

  fetch('https://storage.sbg.cloud.ovh.net/v1/AUTH_52abbf42f96c4960876d50d2965bb9af/trackwatt-data/current_month_energy_consumption.json', {cache: "no-store"})
    .then(response => response.json())
    .then(data => {
      fetch_mean_daily_energy_consumption(data)
    }
      );
  

  function fetch_mean_daily_energy_consumption(data_current){
    fetch('https://storage.sbg.cloud.ovh.net/v1/AUTH_52abbf42f96c4960876d50d2965bb9af/trackwatt-data/mean_daily_energy_consumption.json', {cache: "no-store"})
      .then(response => response.json())
      .then(data_daily => {
        chart_current_month_energy_consumption(data_current, data_daily)
        update_text_current_month_energy_consumption(data_current, data_daily)
      }
        );
  }
  }

main();

setInterval(function() {
    main();
}, 15 * 60 * 1000);
