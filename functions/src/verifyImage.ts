import { db, FieldValue } from './admin';

export async function verifyImage(photoUrl: string, reportId: string): Promise<void> {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 10,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'url', url: photoUrl } },
            {
              type: 'text',
              text: 'Does this photo show a flooded road or street with standing water? Answer only: YES, NO, or UNCERTAIN.',
            },
          ],
        }],
      }),
    });

    const json = (await res.json()) as { content?: Array<{ text: string }> };
    const answer = (json.content?.[0]?.text ?? '').trim().toUpperCase();

    const update: Record<string, unknown> = {
      photoVerified: answer === 'YES' ? true : answer === 'NO' ? false : null,
    };
    if (answer === 'NO') {
      update['trustScore'] = FieldValue.increment(-40);
    }

    await db.collection('reports').doc(reportId).update(update);
  } catch (err) {
    console.error('verifyImage failed:', err);
    await db.collection('reports').doc(reportId).update({ photoVerified: null });
  }
}
