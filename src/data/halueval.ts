export interface HaluEvalSample {
  context: string;
  claim: string;
  groundTruth: string;
}

export const haluEvalSamples: HaluEvalSample[] = [
  {
    context:
      "The Great Wall of China is a series of fortifications made of stone, brick, tamped earth, wood, and other materials, generally built along an east-to-west line across the historical northern borders of China. It was built over many centuries by various Chinese dynasties to protect against invasions. The wall stretches over 13,000 miles in total length and was constructed between the 7th century BC and the 17th century AD.",
    claim:
      "The Great Wall of China was built in a single dynasty under Emperor Qin Shi Huang to protect China from Mongol invasions. The wall is exactly 5,500 miles long and was completed in just 10 years. It is the only man-made structure visible from space with the naked eye. The wall runs from east to west across northern China.",
    groundTruth:
      "The Great Wall of China was built over many centuries by various Chinese dynasties, not just under one emperor. It stretches over 13,000 miles in total length. The claim that it is the only man-made structure visible from space is a popular myth that has been debunked by astronauts.",
  },
  {
    context:
      "Albert Einstein was born on March 14, 1879, in Ulm, in the Kingdom of Württemberg in the German Empire. He developed the theory of relativity, one of the two pillars of modern physics. His work is also known for its influence on the philosophy of science. He received the Nobel Prize in Physics in 1921 for his discovery of the law of the photoelectric effect.",
    claim:
      "Albert Einstein was born in Berlin, Germany in 1879. He invented the theory of relativity and the atomic bomb. Einstein received the Nobel Prize in Physics for his theory of relativity in 1920. He was known to have failed mathematics during his school years.",
    groundTruth:
      "Albert Einstein was born in Ulm, not Berlin. He developed, not invented, the theory of relativity. He received the Nobel Prize in 1921 for the photoelectric effect, not for relativity. The story that he failed mathematics is a common myth — he excelled at mathematics from a young age.",
  },
  {
    context:
      "The Amazon River is the largest river in the world by discharge volume of water. It flows through the countries of Peru, Colombia, and Brazil. The Amazon basin is the world's largest drainage basin. The river is approximately 6,400 km long and is home to the world's largest rainforest, the Amazon rainforest.",
    claim:
      "The Amazon River is the longest river in the world, surpassing the Nile. It flows exclusively through Brazil and is approximately 7,000 km long. The Amazon rainforest covers only Brazil and is the world's second-largest rainforest. The river discharges more water than any other river on Earth.",
    groundTruth:
      "The Amazon is the largest river by discharge volume but not necessarily the longest (the Nile is generally considered longer). The Amazon flows through Peru, Colombia, and Brazil — not exclusively Brazil. The Amazon rainforest spans multiple countries. The river is approximately 6,400 km long, not 7,000 km.",
  },
  {
    context:
      "The human brain contains approximately 86 billion neurons. It consumes about 20% of the body's energy despite being only 2% of total body weight. The brain is divided into several regions including the cerebrum, cerebellum, and brainstem. Neurons communicate with each other through synapses using neurotransmitters.",
    claim:
      "The human brain contains exactly 100 billion neurons and consumes 50% of the body's energy. The brain is divided into two main parts: the left brain (logical) and the right brain (creative). These two sides operate completely independently. Neurons communicate through direct electrical connections without any chemical intermediaries.",
    groundTruth:
      "The brain has approximately 86 billion neurons, not 100 billion. It consumes about 20% of body energy, not 50%. The left-brain/right-brain divide is an oversimplification — both hemispheres work together. Neurons communicate via synapses using neurotransmitters (chemical signals), not purely direct electrical connections.",
  },
  {
    context:
      "Shakespeare wrote 37 plays, 154 sonnets, and several long poems. He was born in Stratford-upon-Avon in 1564 and died in 1616. His plays have been translated into every major language and are performed more often than those of any other playwright. He wrote tragedies, comedies, and histories.",
    claim:
      "Shakespeare wrote over 50 plays and was born in London in 1564. His most famous works include Romeo and Juliet, Hamlet, and The Great Gatsby. He wrote exclusively tragedies and is considered the inventor of the English language. Shakespeare died in 1620.",
    groundTruth:
      "Shakespeare wrote 37 plays, not over 50. He was born in Stratford-upon-Avon, not London. The Great Gatsby was written by F. Scott Fitzgerald, not Shakespeare. He wrote tragedies, comedies, and histories. He died in 1616, not 1620, and did not invent the English language.",
  },
];
