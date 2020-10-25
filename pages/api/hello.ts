import { NextApiRequest, NextApiResponse } from "next";

const Hello = (_: NextApiRequest, res: NextApiResponse): void => {
  res.status(200).json({ text: "Hello" });
}

export default Hello
