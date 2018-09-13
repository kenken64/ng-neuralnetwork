import { Component, OnInit  } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  
  title = 'ng-neuralnetwork';
  color = d3.scaleOrdinal(d3.schemeOranges);
  // radius size
  nodeSize: number = 17;
  hiddenLayersDepths = [10, 10, 10, 10, 10];

  inputlayer: number = 5;
  hiddenlayer: number = 1;
  hiddenDepth: number = 0;
  outputlayer: number = 2;
  svg: any;

  ngOnInit() {
    if (!d3.select("svg")[0]) {

		} else {
			//clear d3
			d3.select('svg').remove();
    }

    this.svg = d3.select("#nn").append("svg")
      .attr("width", 441)
      .attr("height", 400);

    this.drawNeuralNetwork();
  }

  onInputChangeILayer(event: any) {
    console.log("changing slider ..." + event.value);
    this.inputlayer = event.value;
    this.drawNeuralNetwork();
  }

  onInputChangeHLayer(event: any) {
    console.log("changing slider ..." + event.value);
    this.hiddenlayer = event.value;
    this.drawNeuralNetwork();
  }

  onInputChangeHLayerD(event: any) {
    console.log("changing slider ..." + event.value);
    this.hiddenDepth = event.value;
    this.hiddenLayersDepths = [];
    for (let i: number = 0; i < +this.hiddenlayer; i++) {
      this.hiddenLayersDepths.push(+this.hiddenDepth);
    }
    console.log(this.hiddenLayersDepths);
    this.drawNeuralNetwork();
  }

  onInputChangeOLayer(event: any) {
    console.log("changing slider ..." + event.value);
    this.outputlayer = event.value;
    this.drawNeuralNetwork();
  }

  drawNeuralNetwork(){
    d3.select('svg').remove();
    this.svg = d3.select("#nn").append("svg")
      .attr("width", 441)
      .attr("height", 400);
    // build nodes 
    let networkGraph = this.buildNodeGraph();
    // draw graph
    this.drawGraph(networkGraph, this.svg);
  }

  buildNodeGraph() {
		var newGraph = {
			"nodes": []
		};

		//construct input layer
    var newFirstLayer = [];
   
    console.log(this.inputlayer);
    console.log(this.hiddenlayer);
    console.log(this.outputlayer);

		for (var i = 0; i < this.inputlayer; i++) {
			var newTempLayer = {"label": "i "+i, "layer": 1, "type": 1};
			newFirstLayer.push(newTempLayer);
		}

		//construct hidden layers
		var hiddenLayers = [];
		for (var hiddenLayerLoop = 0; hiddenLayerLoop < this.hiddenlayer; hiddenLayerLoop++) {
			var newHiddenLayer = [];
			//for the height of this hidden layer
			for (var i = 0; i < this.hiddenLayersDepths[hiddenLayerLoop]; i++) {
				var newTempLayer = {"label": "h "+ hiddenLayerLoop + i, "layer": (hiddenLayerLoop+2), "type": 2};
				newHiddenLayer.push(newTempLayer);
			}
			hiddenLayers.push(newHiddenLayer);
		}

		//construct output layer
		var newOutputLayer = [];
		for (var i = 0; i < this.outputlayer; i++) {
			var newTempLayer = {"label": "o "+i, "layer": this.hiddenlayer + 2, "type": 3};
			newOutputLayer.push(newTempLayer);
		}

		//add to newGraph
		var allMiddle = newGraph.nodes.concat.apply([], hiddenLayers);
		newGraph.nodes = newGraph.nodes.concat(newFirstLayer, allMiddle, newOutputLayer );

		return newGraph;

  }

  drawGraph(networkGraph, svg) {
		var graph = networkGraph;
		var nodes = graph.nodes;

		// get network size
		var netsize = {};
		nodes.forEach(function (d) {
			if(d.layer in netsize) {
				netsize[d.layer] += 1;
			} else {
				netsize[d.layer] = 1;
			}
			d["lidx"] = netsize[d.layer];
		});

		// calc distances between nodes
		var largestLayerSize = Math.max.apply(
			null, Object.keys(netsize).map(function (i) { return netsize[i]; }));

		var xdist = 400 / Object.keys(netsize).length,
			ydist = (400-15) / largestLayerSize;

		// create node locations
		nodes.map(function(d) {
			d["x"] = (d.layer - 0.5) * xdist;
			d["y"] = ( ( (d.lidx - 0.5) + ((largestLayerSize - netsize[d.layer]) /2 ) ) * ydist )+10 ;
		});

		// autogenerate links
		var links = [];
		nodes.map(function(d, i) {
			for (var n in nodes) {
				if (d.layer + 1 == nodes[n].layer) {
					links.push({"source": parseInt(i), "target": parseInt(n), "value": 1}) }
			}
		}).filter(function(d) { return typeof d !== "undefined"; });

		// draw links
		var link = svg.selectAll(".link")
		.data(links)
		.enter().append("line")
		.attr("class", "link")
		.attr("x1", function(d) { return nodes[d.source].x; })
		.attr("y1", function(d) { return nodes[d.source].y; })
		.attr("x2", function(d) { return nodes[d.target].x; })
		.attr("y2", function(d) { return nodes[d.target].y; })
		.style("stroke-width", function(d) { return Math.sqrt(d.value); });

		// draw nodes
		var node = svg.selectAll(".node")
		.data(nodes)
		.enter().append("g")
		.attr("transform", function(d) {
			return "translate(" + d.x + "," + d.y + ")"; }
		);

		var circle = node.append("circle")
		.attr("class", "node")
		.attr("r", this.nodeSize)
		.style("fill", function(d) {
      let colourValue = "rgb(224, 24, 29)"
      if(d.type === 1){
        console.log("input colour");
        colourValue = "rgb(255, 127, 14";  
      }else if(d.type === 2){
        colourValue = "rgb(174, 199, 232)";
      }else{
        colourValue = "rgb(31, 119, 180)";
      }
      return colourValue; 
    });


		node.append("text")
		.attr("dx", "-.35em")
		.attr("dy", ".35em")
		.attr("font-size", ".6em")
		.text(function(d) { return d.label; });
	}

  
  formatLabel(value: number | null) {
    if (!value) {
      return 0;
    }

    if (value >= 1000) {
      return Math.round(value / 1000) + 'k';
    }

    return value;
  }
}
