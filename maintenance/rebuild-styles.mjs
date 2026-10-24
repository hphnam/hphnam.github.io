import fs from 'node:fs';
import crypto from 'node:crypto';
const styles=['fonts.css','style.css','editorial.css','white.css','cases.css','deck-fonts.css','authored.css','poster-story.css','coop-native.css','brain-native.css','duty-thumbnail.css','case-mechanisms.css','bespoke-campaign.css','spill-campaign.css','home-refinement.css','werewolf-case.css','werewolf-engine.css','camera-lab.css','becks-summer.css','becks-social.css','site-navigation.css','about-profile.css','home-media.css','market-research.css','aqua-case.css','aqua-enrichment.css','work-thumbnails.css','glass-navigation.css','campaign-autoplay.css','screen-engraving.css','profile-discovery.css','profile-open.css','service-skill-liquid-v2.css','feature-space.css','freshness-case.css'];
const assets = new URL('../assets/', import.meta.url);
const missing = fs.readdirSync(assets).filter(name => name.endsWith('.css') && name !== 'portfolio.css' && !styles.includes(name));
if (missing.length) throw new Error('Stylesheets missing from the build order: ' + missing.join(', '));
const css = styles.map(name => '/* ' + name + ' */\n' + fs.readFileSync(new URL(name, assets), 'utf8')).join('\n');
const version = crypto.createHash('sha256').update(css).digest('hex').slice(0, 12);
const indexPath = new URL('../index.html', import.meta.url);
let html = fs.readFileSync(indexPath, 'utf8');
let linked = 0;
html = html.replace(/(<link\b[^>]*\bhref=["'])assets\/portfolio\.css(?:\?[^"']*)?(["'][^>]*>)/g, (_, before, after) => {
  linked++;
  return before + 'assets/portfolio.css?v=' + version + after;
});
if (linked !== 1) throw new Error('Expected exactly one portfolio stylesheet link; found ' + linked);
fs.writeFileSync(new URL('portfolio.css', assets), css);
fs.writeFileSync(indexPath, html);
console.log('Prepared ' + styles.length + ' stylesheets in cascade order; linked bundle version ' + version + '.');
