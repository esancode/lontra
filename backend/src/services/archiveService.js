import Note from '../models/Note.js';
import Box from '../models/Box.js';

async function getBoxPath(boxId) {
  const path = [];
  let currentId = boxId;

  while (currentId) {
    const box = await Box.findById(currentId).lean();
    if (!box) break;
    path.unshift({ id: box._id.toString(), name: box.name, type: 'box' });
    currentId = box.parentId;
  }

  return path;
}

export async function ensureDraftBox(ownerId) {
  let draftBox = await Box.findOne({ name: 'Rascunhos', parentId: null, ownerId }).lean();
  if (!draftBox) {
    draftBox = await Box.create({ name: 'Rascunhos', parentId: null, color: '#6e7681', ownerId });
  }
  return draftBox;
}

export async function saveDraft(rawText, ownerId) {
  const draftBox = await ensureDraftBox(ownerId);
  const draft = await Note.create({
    title: 'Rascunho',
    icon: 'vscode-icons:default-file',
    content: {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: rawText }] }],
    },
    boxId: draftBox._id,
    tags: [],
    ownerId,
  });
  return { draftId: draft._id.toString(), draftBoxId: draftBox._id.toString() };
}

export async function saveNote(aiResult, ownerId) {
  const { title, icon, content, archiveDecision } = aiResult;
  let targetBoxId = null;
  let createdBoxPath = [];

  if (archiveDecision.type === 'existing') {
    const box = await Box.findOne({ _id: archiveDecision.boxId, ownerId }).lean();
    if (!box) {
      const newBox = await Box.create({ name: 'Sem Categoria', parentId: null, ownerId });
      targetBoxId = newBox._id;
      createdBoxPath = [{ id: newBox._id.toString(), name: newBox.name, type: 'box' }];
    } else {
      targetBoxId = box._id;
      createdBoxPath = await getBoxPath(box._id);
    }
  }

  if (archiveDecision.type === 'new') {
    const newBox = await Box.create({ name: archiveDecision.boxName, parentId: null, ownerId });
    targetBoxId = newBox._id;
    createdBoxPath = [{ id: newBox._id.toString(), name: newBox.name, type: 'box' }];
  }

  if (archiveDecision.type === 'nested-new') {
    const parentBox = await Box.findOne({ _id: archiveDecision.parentBoxId, ownerId }).lean();
    if (!parentBox) {
      const newBox = await Box.create({ name: archiveDecision.boxName, parentId: null, ownerId });
      targetBoxId = newBox._id;
      createdBoxPath = [{ id: newBox._id.toString(), name: newBox.name, type: 'box' }];
    } else {
      const newBox = await Box.create({ name: archiveDecision.boxName, parentId: parentBox._id, ownerId });
      targetBoxId = newBox._id;
      createdBoxPath = [
        ...(await getBoxPath(parentBox._id)),
        { id: newBox._id.toString(), name: newBox.name, type: 'box' },
      ];
    }
  }

  const note = await Note.create({ title, icon, content, boxId: targetBoxId, tags: [], ownerId });

  return {
    noteId: note._id.toString(),
    noteTitle: note.title,
    noteIcon: note.icon,
    notePath: [
      ...createdBoxPath,
      { id: note._id.toString(), name: note.title, type: 'note' },
    ],
  };
}

export async function getUserBoxStructure(ownerId) {
  const boxes = await Box.find({ ownerId }).sort({ order: 1 }).lean();

  return boxes.map(box => {
    const ancestors = [];
    let current = box;
    while (current.parentId) {
      const parent = boxes.find(b => b._id.toString() === current.parentId?.toString());
      if (!parent) break;
      ancestors.unshift(parent.name);
      current = parent;
    }
    const pathParts = [...ancestors, box.name];
    return {
      id: box._id.toString(),
      name: box.name,
      parentId: box.parentId ? box.parentId.toString() : null,
      path: pathParts.join(' / '),
    };
  });
}
