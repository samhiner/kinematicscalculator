class graph extends Chart {
	//make a line or bar chart using a given canvas
	constructor(id,sizeData,seconds) {
		var canvas = document.getElementById(id).getContext('2d');
		if (id == 'acceleration') {
			var lineTension = 0;
		} else {
			var lineTension = 0.4;
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
				elements: {
					line: {
						tension: lineTension 
					}
				},
				legend: {
					display: false
				},
				dragData: true,
				onDrag: function (event, datasetIndex, index, value) {
					userSess.alignGraphs(id);
				},
				scales: {
					xAxes: [{
						ticks: {
							autoSkip: true,
							maxTicksLimit: seconds - 1
						}
					}]
				}
			}
		});
	}

	//get an array of the y values of the chart
	getData() {
		return this.config.data.datasets[0].data;
	}

	changeData(array) {
		this.config.data.datasets[0].data = array;
		this.update();
	}

	changeLabels(array) {
		this.config.data.labels = array;
		this.update;
	}

}

class sess {
	//create new graphs with random data and make variables and lambdas which describe the graphs
	constructor() {
		const totalSeconds = this.getGraphSize();

		//TODO: make these correct, will prob have to do an ROC thing
		this.timesT = (oldLevel, newLevel, t) => newLevel[t-1] + (oldLevel[t] + oldLevel[t-1])/2;
		this.divT = (oldLevel, newLevel, t) => (oldLevel[t] - oldLevel[t-1]) * 2;

		this.position = new graph('position',this.initGraph(),totalSeconds);
		this.velocity = new graph('velocity',this.initGraph(),totalSeconds);
		this.acceleration = new graph('acceleration',this.initGraph(),totalSeconds);

		this.alignGraphs('acceleration');
	}

	//grab the graph measurements from the user inputs and clean them into useable data which is used in many of this classes methods
	getGraphSize() {
		const totalSeconds = Number(document.getElementById('seconds').value) + 1;

		this.resolution = Number(document.getElementById('resolution').value);
		//substract (resolution - 1) does not include any points after the max number 
		//ex: if there are 5 points and 4 resolution, 3 points are *not* generated after 5.0
		this.numPoints = totalSeconds * this.resolution - (this.resolution - 1);

		console.log(totalSeconds + ' ' + this.resolution);

		return totalSeconds;
	}

	//make labels and random placeholder data based on number of seconds and how many points there should be per second (resolution)
	//TODO: do rounding so that 999s are rounded but only two the last place before the 999s to prevent random rounding
	initGraph(pastNums = null) {
		let labels = [0];
		let vals = [0]
		//subtract (res - 1) bc otherwise if the max is 5 and res is 4 the max will be 5.75 as it made 3 extra decimals for the max.
		for (var x = 1; x < this.numPoints; x++) {
			if (pastNums && pastNums[x]) {
				vals[x] = pastNums[x]
			} else {
				vals[x] = Math.random() * 100 - 50;
			}
			let newLabel = labels[x - 1] + 1/this.resolution;
			labels[x] = newLabel;
			
		}

		return [labels, vals];
	}

	//change the graphs so their data is based on the data of the origin graph
	alignGraphs(origin) {

		if (this.numPoints == 0) {
			return;
		}

		let x = this.position.getData();
		let v = this.velocity.getData();
		let a = this.acceleration.getData();

		//TODO make it so the for loop isn't repeated three times.
		if (origin == 'position') {
			for (var t = 1; t < this.numPoints; t++) {
				v[t] = this.divT(x, v, t);
				a[t] = this.divT(v, a, t);
			}
		} else if (origin == 'velocity') {
			for (var t = 1; t < this.numPoints; t++) {
				x[t] = this.timesT(v, x, t);
				a[t] = this.divT(v, a, t);
			}
		} else if (origin == 'acceleration') {
			for (var t = 1; t < this.numPoints; t++) {
				v[t] = this.timesT(a, v, t);
				x[t] = this.timesT(v, x, t);
			}
		}

		this.position.changeData(x);
		this.velocity.changeData(v);
		this.acceleration.changeData(a);

	}

	//change the number of points on the screen while preserving as much of the data from before the resizing as possible
	graphPointsChange() {
		const totalSeconds = this.getGraphSize();
		const oldVals = this.acceleration.getData();

		const newData = this.initGraph(oldVals);

		this.acceleration.changeLabels(newData[0]);
		this.position.changeLabels(newData[0])
		this.velocity.changeLabels(newData[0])

		this.acceleration.changeData(newData[1]);

		//if input is <= 0 only show one point on each graph
		if (newData[0] == 0) {
			this.velocity.changeData(newData[1]);
			this.position.changeData(newData[1]);
			return;
		}

		this.alignGraphs('acceleration');
	}

}

var userSess = new sess();

/*DOCS (ISSUE: make this more accurate):

//position = position last second + whatever the effective velocity was over the last second
//effective velocty is average of last second's and this second's velocity. returns same value as v0t + 1/2at^2.
x[t] = x[t - 1] + ((v[t] + v[t-1])/2)


//velocity = difference between current position and position one second ago times 2
//times 2 because otherwise you get Vavg for the second between the instant being measured and the last second
//this gets V at the end of that second (now)
v[t] = (x[t] - x[t-1]) * 2

*/