import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['Owner', 'Lead', 'Developer', 'Viewer'],
    default: 'Developer',
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a project title'],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, 'Please provide a project description'],
      maxlength: 2000,
    },
    category: {
      type: String,
      enum: ['Web Development', 'Mobile App', 'AI / ML', 'DevOps', 'Cloud & Infra', 'Open Source', 'Other'],
      default: 'Web Development',
    },
    repositoryUrl: {
      type: String,
      default: '',
    },
    demoUrl: {
      type: String,
      default: '',
    },
    techStack: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ['Planning', 'Active', 'Completed', 'On Hold'],
      default: 'Active',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [memberSchema],
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model('Project', projectSchema);

export default Project;
