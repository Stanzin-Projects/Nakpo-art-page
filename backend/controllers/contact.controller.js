import Contact from '../models/Contact.model.js';

export const submitContact = async (req, res) => {
  try {
    const contact = await Contact.create(req.body);
    res.status(201).json({ message: 'Message sent', id: contact._id });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
