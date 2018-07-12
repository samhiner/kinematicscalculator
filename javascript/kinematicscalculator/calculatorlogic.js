class graph extends Chart {
	constructor(id,type) {
		var canvas = document.getElementById(id).getContext('2d');
		if (type == 'bar') {
			var labels = ['0-1', '1-2', '2-3', '3-4', '4-5']
		} else {
			var labels = ['0', '1', '2', '3', '4', '5']
		}

		super(canvas, {
			type: type,
			data: {
				labels: labels,
				datasets: [
					{
						data: [100, 19, 29, 20, 30, 20],
						fill: false
					}
				]
			},
			options: {
				legend: {
					display: false
				},
				dragData: true,
				//add it so on every movement alignGraphs is triggered using the functions in the docs for dragData
				barPercentage: 1.0,
				scales: {
					xAxes: [{
						barPercentage: 1,
						categoryPercentage: 1
					}],
				}
			}
		});
	}

	changeVals(array) {
		this.config.data.datasets[0].data = array;
		this.update();
	}

}

function alignGraphs(origin) {
	arr = ['position','velocity','acceleration'];
	arr.indexOf(origin)
	//make it so for every -1 you do another multiplication by time?
	//will get nums for each second and output an array of them to changeVals
	//have each second be based on last one 
	//x-not in equation would be at start of that second if you are trying to find end of second
}

var position = new graph('position','line');
var velocity = new graph('velocity','line');
var acceleration = new graph('acceleration','bar');

//acceleration.changeVals([100, 100, 100, 100, 100, 100])