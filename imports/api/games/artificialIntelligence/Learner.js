const synaptic = require('synaptic');
const async = require('async');
const _ = require('lodash');

const Architect = synaptic.Architect;
const Network = synaptic.Network;

export default class Learner {
	numberOfInputs = 0;
	numberOfOutputs = 0;

	//Array of networks for current Genomes
	//(Genomes will be added the key `fitness`)
	genomes = [];

	//Current genome/generation tryout
	genome = 0;
	generation = 0;

	constructor(numberOfInputs, numberOfOutputs, numberOfGenomes, selection, mutationProb) {
		this.numberOfInputs = numberOfInputs;
		this.numberOfOutputs = numberOfOutputs;
		this.genomeUnits = numberOfGenomes;
		this.selection = selection;
		this.mutationProb = mutationProb;
	}

	init() {
		this.genome = 0;
		this.generation = 0;
	}

	emitData(inputs) {
		if (this.onSensorData) {
			return this.onSensorData(inputs);
		}

		return [];
	}

	applyGenomeFitness(fitness) {
		if (this.onGameEnd) {
			this.onGameEnd(fitness);
		}
	}

	//Build genomes before calling executeGeneration.
	startLearning() {
		//Build genomes if needed
		while (this.genomes.length < this.genomeUnits) {
			this.genomes.push(this.buildGenome(this.numberOfInputs, this.numberOfOutputs));
		}

		this.executeGeneration();
	}

	getGenomes() {
		const jsonGenomes = [];
		for (let k in this.genomes) {
			jsonGenomes.push(this.genomes[k].toJSON());
		}

		return JSON.stringify(jsonGenomes);
	}

	loadGenomes(genomes, deleteOthers) {
		genomes = JSON.parse(genomes);

		if (deleteOthers) {
			this.genomes = [];
			this.genome = 0;
			this.generation = 0;
		}

		let loaded = 0;
		for (let k in genomes) {
			this.genomes.push(Network.fromJSON(genomes[k]));
			loaded++;
		}
	}

	/**
	 * @private
	 *
	 * Given the entire generation of genomes, applies method `executeGenome` for each element.
	 *
	 * After all elements have completed executing:
	 * 1) Select best genomes
	 * 2) Does cross over (except for 2 genomes)
	 * 3) Does Mutation-only on remaining genomes
	 * 4) Execute generation (recursively)
	 */
	executeGeneration() {
		this.generation++;
		this.genome = 0;

		async.mapSeries(
			this.genomes,
			(genome, next) => this.executeGenome(genome, next),
			() => {
				this.filterGenomesOnGenerationEnd();
			}
		)
	}

	/**
	 * @private
	 */
	filterGenomesOnGenerationEnd() {
		//Kill worst genomes
		this.genomes = this.selectBestGenomes(this.selection);

		//Copy best genomes
		const bestGenomes = _.clone(this.genomes);

		//Cross Over
		while (this.genomes.length < this.genomeUnits - 2) {
			//Get two random Genomes
			const genA = _.sample(bestGenomes).toJSON();
			const genB = _.sample(bestGenomes).toJSON();

			//Cross over and Mutate
			const newGenome = this.mutate(this.crossOver(genA, genB));

			//Add to generation
			this.genomes.push(Network.fromJSON(newGenome));
		}

		//Mutation-only
		while (this.genomes.length < this.genomeUnits) {
			//Get two random Genomes
			const gen = _.sample(bestGenomes).toJSON();

			//Cross over and Mutate
			const newGenome = this.mutate(gen);

			//Add to generation
			this.genomes.push(Network.fromJSON(newGenome));
		}

		//Execute next generation
		this.executeGeneration();
	}

	/**
	 * @private
	 * @param {int} selectN
	 * @returns {*}
	 *
	 * Sort all the genomes, and delete the worst one until the genome list has selectN elements.
	 */
	selectBestGenomes(selectN) {
		const selected = _.sortBy(this.genomes, 'fitness').reverse();

		while (selected.length > selectN) {
			selected.pop();
		}

		console.log('Fitness (' + this.generation + '): ' + _.map(selected, 'fitness').join(','));

		return selected;
	}

	/**
	 * @private
	 * @param genome
	 * @param next
	 *
	 * 1) Set's listener for sensorData
	 * 2) On data read, applies the neural network, and sets its output
	 * 3) When the game has ended, computes the fitness
	 */
	executeGenome(genome, next) {
		this.genome = this.genomes.indexOf(genome) + 1;

		//Reads sensor data, and apply network
		this.onSensorData = (inputs) => {
			//Apply to network
			return genome.activate(inputs);
		};

		//Wait game end, and compute fitness
		this.onGameEnd = (fitness) => {
			//Save Genome fitness
			genome.fitness = fitness;
			console.log('fitness = ' + fitness);

			//Go to next genome
			next();
		};
	}

	/**
	 * @private
	 * @param {int} inputs
	 * @param {int} outputs
	 * @returns {Architect.Perceptron}
	 *
	 * Builds a new genome based on the expected number of inputs and outputs
	 */
	buildGenome(inputs, outputs) {
		return new Architect.Perceptron(inputs, (inputs + outputs) / 2, outputs);
	}

	/**
	 * @private
	 * @param netA
	 * @param netB
	 * @returns {*}
	 *
	 * SPECIFIC to Neural Network. Those two methods convert from JSON to Array, and from Array to JSON
	 */
	crossOver(netA, netB) {
		//Swap (50% prob.)
		if (Math.random() > 0.5) {
			const tmp = netA;
			netA = netB;
			netB = tmp;
		}

		//Clone network
		netA = _.cloneDeep(netA);
		netB = _.cloneDeep(netB);

		//Cross over data keys
		this.crossOverDataKey(netA.neurons, netB.neurons, 'bias');

		return netA;
	}

	/**
	 * @private
	 * @param net
	 * @returns {*}
	 *
	 * Does random mutations across all the biases and weights of the Networks
	 * (This must be done in the JSON to prevent modifying the current one)
	 */
	mutate(net) {
		//Mutate
		this.mutateDataKeys(net.neurons, 'bias', this.mutationProb);

		this.mutateDataKeys(net.connections, 'weight', this.mutationProb);

		return net;
	}

	/**
	 * @private
	 * @param a
	 * @param b
	 * @param key
	 *
	 * Given an Object A and an object B, both Arrays of Objects:
	 * 1) Select a cross over point (cutLocation) randomly (going from 0 to A.length)
	 * 2) Swap values from `key` one to another, starting by cutLocation
	 */
	crossOverDataKey(a, b, key) {
		const cutLocation = Math.round(a.length * Math.random());

		let tmp;
		for (let k = cutLocation; k < a.length; k++) {
			//Swap
			tmp = a[k][key];
			a[k][key] = b[k][key];
			b[k][key] = tmp;
		}
	}

	/**
	 * @private
	 * @param a
	 * @param key
	 * @param mutationRate
	 *
	 * Given an Array of objects with key `key`, and also a `mutationRate`, randomly Mutate the value of each key
	 * if random value is lower than mutationRate for each element.
	 */
	mutateDataKeys(a, key, mutationRate) {
		for (let k = 0; k < a.length; k++) {
			//Should mutate?
			if (Math.random() > mutationRate) {
				continue;
			}

			a[k][key] += a[k][key] * (Math.random() - 0.5) * 3 + (Math.random() - 0.5);
		}
	}
}
