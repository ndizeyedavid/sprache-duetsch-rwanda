import unittest
from reading_blocks import repair_numbered_lists

class ReadingBlocksTest(unittest.TestCase):
    def test_wrapped_numbered_prose(self):
        blocks=['<p>Vowels:</p>', '<div><table><tbody><tr><td>1.</td><td>Long when doubled</td></tr></tbody></table></div>',
          '<p>(Saal, Tee, Boot).</p>', '<div><table><tbody><tr><td>2.</td><td>Short before consonants (Mann,</td></tr></tbody></table></div>',
          '<p>kommen). 3. ie is long.</p>', '<h2>Next topic</h2>']
        result=repair_numbered_lists(blocks)
        self.assertEqual(result[1], '<ol start="1"><li>Long when doubled (Saal, Tee, Boot).</li><li>Short before consonants (Mann, kommen).</li><li>ie is long.</li></ol>')
        self.assertEqual(result[2], '<h2>Next topic</h2>')
    def test_real_tables_are_preserved(self):
        block='<div><table><tbody><tr><td>Letter</td><td>Sound</td></tr><tr><td>A</td><td>ah</td></tr></tbody></table></div>'
        self.assertEqual(repair_numbered_lists([block]), [block])

if __name__=='__main__':unittest.main()
