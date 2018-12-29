export default interface Learner {
	generation: number;

	init();

	loadGenomes(genomes: string, deleteOthers: boolean);

	getGenomes(): string;

	startLearning();

	applyGenomeFitness(fitness: number);

	emitData(inputs: number[]);
}
