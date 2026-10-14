// Verbatim excerpts from the supplied experiment files.
export const cameraExcerpts={
  "text": {
    "code": "entry = {\n    \"id\": f\"{motion_key}_scene{scene_idx:02d}\",\n    \"motion\": motion_key,\n    \"scene_idx\": scene_idx,\n    \"scene\": scene,\n    \"prompt_baseline\": f\"{scene}, {motion_text}\",\n    \"prompt_experiment\": scene,  # NO camera text — MotionLoRA handles it\n    \"lora_id\": MOTION_LORAS[motion_key],\n}",
    "start": null,
    "file": "SCC456_MotionLoRA_Pipeline.ipynb / prompt dataset"
  },
  "lora": {
    "code": "if current_lora != motion:\n    try:\n        pipe.unload_lora_weights()\n    except Exception:\n        pass\n    \n    print(f\"  Loading MotionLoRA: {motion}...\")\n    pipe.load_lora_weights(lora_id, adapter_name=motion)\n    pipe.set_adapters([motion], adapter_weights=[1.0])\n    current_lora = motion\n    flush_gpu()",
    "start": null,
    "file": "SCC456_MotionLoRA_Pipeline.ipynb / adapter loading"
  },
  "pose": {
    "code": "def run_one(pose_file, out_name):\n    env = os.environ.copy()\n    env[\"PYTORCH_CUDA_ALLOC_CONF\"] = \"expandable_segments:True\"\n    env[\"CUDA_VISIBLE_DEVICES\"] = \"0\"\n\n    cmd = [\n        torchrun, \"--standalone\", \"--nproc_per_node=1\",\n        \"inference.py\",\n        \"--out_root\", f\"./output/{out_name}\",\n        \"--ori_model_path\", \"./models/StableDiffusion\",\n        \"--unet_subfolder\", \"unet_webvidlora_v3\",\n        \"--motion_module_ckpt\", \"./models/Motion_Module/v3_sd15_mm.ckpt\",\n        \"--pose_adaptor_ckpt\", \"./models/CameraCtrl/CameraCtrl.ckpt\",\n        \"--model_config\", \"configs/train_cameractrl/adv3_256_384_cameractrl_relora.yaml\",\n        \"--visualization_captions\", \"assets/cameractrl_prompts.json\",\n        \"--use_specific_seeds\",\n        \"--trajectory_file\", pose_file,\n        \"--n_procs\", \"1\",\n        \"--num_inference_steps\", \"25\",\n        \"--guidance_scale\", \"7.5\",\n    ]\n    subprocess.run(cmd, env=env, check=True)",
    "start": 93,
    "file": "cameractrl_run.py"
  },
  "patchBefore": {
    "code": "attention_probs = attn.get_attention_scores(query, key, attention_mask)\nhidden_states = torch.bmm(attention_probs, value)",
    "start": null
  },
  "patchAfter": {
    "code": "# patched for 12GB GPU\nhidden_states = F.scaled_dot_product_attention(\n    query.unsqueeze(0) if query.dim() == 3 else query,\n    key.unsqueeze(0) if key.dim() == 3 else key,\n    value.unsqueeze(0) if value.dim() == 3 else value,\n    attn_mask=attention_mask,\n)\nif hidden_states.dim() == 4:\n    hidden_states = hidden_states.squeeze(0)",
    "start": null
  }
};
