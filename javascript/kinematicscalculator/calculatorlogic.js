class graph extends Chart {
	//make a line or bar chart using a given canvas
	constructor(id,sizeData,seconds) {
		var canvas = document.getElementById(id).getContext('2d');
		if (id == 'acceleration') {
			var firstPoint = null;
		} else {
			var firstPoint = 'black';
		}
		super(canvas, {
			type: 'line',
			data: {
				labels: sizeData[0],
				datasets: [
					{
						data: sizeData[1],
						fill: false,
					}
				]
			},
			options: {
				legend: {
					display: false
				},
				dragData: true,
				onDrag: function (event, datasetIndex, index, value) {
					alignGraphs(id);
				},
				scales: {
					xAxes: [{
						ticks: {
							autoSkip: true,
							maxTicksLimit: seconds - 1 //ISSUE: pass seconds and figure out why it didn't work when you tried it before
						}
					}]
				}
			}
		});
	}

	//get an array of the y values of the chart
	getData() {
		return this.config.data.datasets[0].data
	}

	changeData(array) {
		this.config.data.datasets[0].data = array;
		this.update();
	}

}


function alignGraphs(origin, seconds) {

	x = position.getData()
	v = velocity.getData()
	a = acceleration.getData()

	var timesT = (oldLevel, newLevel, t) => newLevel[t-1] + (oldLevel[t] + oldLevel[t-1])/2;
	var divT = (oldLevel, newLevel, t) => (oldLevel[t] - oldLevel[t-1]) * 2;

	//ISSUE make it so the proper times/div is triggered without explicit ifs so I can add this to the main class bc thatd be cool
	if (origin == 'position') {
		for (var t = 1; t < numPoints; t += 1/resolution) {
			v[t] = divT(x, v, t);
			a[t] = divT(v, a, t);
		}
	} else if (origin == 'velocity') {
		for (var t = 1; t < numPoints; t += 1/resolution) {
			x[t] = timesT(v, x, t);
			a[t] = divT(v, a, t);
		}
	} else if (origin == 'acceleration') {
		for (var t = 1; t < numPoints; t += 1/resolution) {
			v[t] = timesT(a, v, t);
			x[t] = timesT(v, x, t);
		}
	}

	position.changeData(x);
	velocity.changeData(v);
	acceleration.changeData(a);

}
/*DOCS (ISSUE: make this accurate):

//position = position last second + whatever the effective velocity was over the last second
//effective velocty is average of last second's and this second's velocity. returns same value as v0t + 1/2at^2.
x[t] = x[t - 1] + ((v[t] + v[t-1])/2)


//velocity = difference between current position and position one second ago times 2
//times 2 because otherwise you get Vavg for the second between the instant being measured and the last second
//this gets V at the end of that second (now)
v[t] = (x[t] - x[t-1]) * 2

*/

//make labels and random placeholder data based on number of seconds and how many points there should be per second (resolution)
function makeGraphData(seconds, resolution) {
	labels = [0];
	vals = [0]
	//subtract res - 1 bc otherwise if the max is 5 and res is 4 the max will be 5.75 as it made 3 extra decimals for the max.
	for (var x = 1; x < (seconds * resolution) - (resolution - 1); x++) {
		newLabel = labels[x - 1] + 1/resolution;
		//if the number on the x axis is very close to a whole number, round it to that number. prevents 1 being 0.9999 when resolution is 3.
		if ((String(newLabel).indexOf('.') == -1) || (String(newLabel).split('.')[1].indexOf('9999') != -1) || (String(newLabel).split('.')[1].indexOf('0000') != -1)) {
			newLabel = Math.round(newLabel)
		}
		labels[x] = newLabel
		vals[x] = Math.random() * 100 - 50;
	}
	return [labels, vals];
}

function resetGraph() {
	return;
}

//MAJOR ISSUE: this should run in resetGrapoh but that should be in a class so p, v, and a are accesable by other functions
//IDEA: once in resetGraph maybe find a way to not randomize data after the first time so you can get higher res without starting over
//ISSUE: some number/resolution combination do not go 1-2-3-4 but do random numbers on x-axis.
var totalSeconds = Number(document.getElementById('seconds').value) + 1;
var resolution = Number(document.getElementById('resolution').value);
console.log(totalSeconds + ' ' + resolution)
var numPoints = totalSeconds * resolution - (resolution - 1);

var position = new graph('position',makeGraphData(totalSeconds, resolution),totalSeconds);
var velocity = new graph('velocity',makeGraphData(totalSeconds, resolution),totalSeconds);
var acceleration = new graph('acceleration',makeGraphData(totalSeconds, resolution),totalSeconds);

alignGraphs('acceleration', seconds)

//ISSUE: maybe put this in a class idk