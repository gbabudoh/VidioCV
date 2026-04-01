import * as brain from 'brain.js';

/**
 * Neural Match Aggregator for VidioCV
 * 
 * Uses Brain.js to weight and aggregate multiple matching factors into a final score.
 * This allows for non-linear relationships between factors (e.g., high skill overlap 
 * can compensate for lower title similarity).
 */
class NeuralAggregator {
  private net: brain.NeuralNetwork<number[], number[]>;
  private isTrained = false;

  constructor() {
    this.net = new brain.NeuralNetwork({
      hiddenLayers: [4, 4], // Deep enough for non-linearities, shallow enough for speed
      activation: 'sigmoid'
    });
  }

  /**
   * Bootstraps the neural network with synthetic data based on current heuristics.
   * This ensures the AI doesn't start with "random" logic while allowing it to 
   * generalize.
   */
  async train() {
    if (this.isTrained) return;

    console.log('Bootstrapping Neural Match Aggregator (Brain.js)...');
    
    // Generate synthetic training data
    // Inputs: [skillScore, semanticTitleScore, locationScore, remoteScore, experienceScore]
    const trainingData = [];
    
    // perfect match
    trainingData.push({ input: [1, 1, 1, 1, 1], output: [1] });
    // great skills, okay title
    trainingData.push({ input: [1, 0.5, 0.5, 0.5, 1], output: [0.85] });
    // great title, okay skills
    trainingData.push({ input: [0.5, 1, 0.5, 0.5, 0.5], output: [0.75] });
    // location mismatch but perfect skills/title
    trainingData.push({ input: [1, 1, 0, 0, 1], output: [0.80] });
    // low skills/title
    trainingData.push({ input: [0.2, 0.2, 0.5, 0.5, 0.5], output: [0.25] });
    // total mismatch
    trainingData.push({ input: [0, 0, 0, 0, 0], output: [0] });

    // train the network
    this.net.train(trainingData, {
      iterations: 2000,
      log: false,
      errorThresh: 0.005
    });

    this.isTrained = true;
    console.log('Neural Aggregator trained successfully.');
  }

  /**
   * Predicts a match score (0.0 to 1.0) based on input factors.
   */
  async predict(inputs: {
    skillScore: number;
    titleScore: number;
    locationScore: number;
    remoteScore: number;
    experienceScore: number;
  }): Promise<number> {
    if (!this.isTrained) await this.train();

    const inputArr = [
      inputs.skillScore / 100,
      inputs.titleScore / 100,
      inputs.locationScore / 100,
      inputs.remoteScore / 100,
      inputs.experienceScore / 100
    ];

    const output = this.net.run(inputArr);
    return Math.max(0, Math.min(100, Math.round(output[0] * 100)));
  }
}

export const neuralAggregator = new NeuralAggregator();
