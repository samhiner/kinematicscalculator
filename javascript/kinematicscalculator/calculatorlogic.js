class graph extends Chart {
	//make a line or bar chart using a given canvas
	constructor(id,sizeData) {
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
							maxTicksLimit: 5
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


function alignGraphs(origin) {

	x = position.getData()
	v = velocity.getData()
	a = acceleration.getData()

	var timesT = (oldLevel, newLevel, t) => newLevel[t-1] + (oldLevel[t] + oldLevel[t-1])/2;
	var divT = (oldLevel, newLevel, t) => (oldLevel[t] - oldLevel[t-1]) * 2;

	//ISSUE make it so the proper times/div is triggered without explicit ifs so I can add this to the main class bc thatd be cool
	if (origin == 'position') {
		for (var t = 1; t < 6; t++) {
			v[t] = divT(x, v, t);
			a[t] = divT(v, a, t);
		}
	} else if (origin == 'velocity') {
		for (var t = 1; t < 6; t++) {
			x[t] = timesT(v, x, t);
			a[t] = divT(v, a, t);
		}
	} else if (origin == 'acceleration') {
		for (var t = 1; t < 6; t++) {
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

function makeGraphData(size) {
	labels = [0];
	vals = [0]
	for (var x = 1; x < size; x++) {
		labels[x] = labels[x - 1] + 1;
		vals[x] = Math.random() * 100;
	}
	return [labels, vals];
}

aSize = 6;

var position = new graph('position',makeGraphData(aSize));
var velocity = new graph('velocity',makeGraphData(aSize));
var acceleration = new graph('acceleration',makeGraphData(aSize));

alignGraphs('acceleration')