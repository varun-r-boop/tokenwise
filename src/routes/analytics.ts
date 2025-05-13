import express from 'express';
import { getDB } from '../db/mongoose';

const router = express.Router();
router.get('/:projectId', async (req, res) => {
    try {
      const _mongoDbContext = getDB();
      const requestsEntity = _mongoDbContext.collection('requests');
    const { projectId } = req.params;

    const pipeline = [
        { $match: { projectId } },
          {
            $addFields: {
              week: {
                $isoWeek: "$createdAt",
              },
              year: {
                $isoWeekYear: "$createdAt",
              },
            },
          },
          {
            $group: {
              _id: {
                customerEndpoint: "$customerEndpoint",
                year: "$year",
                week: "$week",
              },
              totalTokensSum: {
                $sum: "$totalTokens",
              },
              costUSDSum: {
                $sum: "$costUSD",
              },
              count: {
                $sum: 1,
              },
              prompts: {
                $push: "$prompt",
              },
            },
          },
          {
            $group: {
              _id: "$_id.customerEndpoint",
              avgTotalTokensPerWeek: {
                $avg: "$totalTokensSum",
              },
              avgCostUSDPerWeek: {
                $avg: "$costUSDSum",
              },
              allPrompts: {
                $push: "$prompts",
              },
            },
          },
          {
            $addFields: {
              allPrompts: {
                $reduce: {
                  input: "$allPrompts",
                  initialValue: [],
                  in: {
                    $concatArrays: ["$$value", "$$this"],
                  },
                },
              },
            },
          },
          {
            $addFields: {
              topPrompt: {
                $first: {
                  $map: {
                    input: {
                      $slice: [
                        {
                          $reverseArray: {
                            $sortArray: {
                              input: {
                                $map: {
                                  input: {
                                    $setUnion: [
                                      "$allPrompts",
                                      [],
                                    ],
                                  },
                                  as: "p",
                                  in: {
                                    k: "$$p",
                                    v: {
                                      $size: {
                                        $filter: {
                                          input:
                                            "$allPrompts",
                                          as: "x",
                                          cond: {
                                            $eq: [
                                              "$$x",
                                              "$$p",
                                            ],
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                              sortBy: {
                                v: -1,
                              },
                            },
                          },
                        },
                        1,
                      ],
                    },
                    as: "item",
                    in: "$$item.k",
                  },
                },
              },
            },
          },
          {
            $project: {
              customerEndpoint: "$_id",
              avgTotalTokensPerWeek: 1,
              avgCostUSDPerWeek: 1,
              topPrompt: 1,
              _id: 0,
            },
          },
      ];
  
      const analytics = await requestsEntity.aggregate(pipeline).toArray();
      res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

export default router;
