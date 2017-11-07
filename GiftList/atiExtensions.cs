using System;

namespace atiExtensions {
	public static class atiExtensions {
		public static string Left(this String s, int len) {
			s = s.Trim();
			if (s.Length <= len)
				return s;
			else
				return s.Substring(0, len);
		}

		public static bool IsNullOrEmpty(this String s) {
			return string.IsNullOrEmpty(s);
		}

		public static string IsNull(this String s, string def) {
			return s == null ? def : s;
		}

		public static int occurs(this String src, string s) {
			int result = 0;
			int lastIndex = 0;
			int nextIndex = src.IndexOf(s);

			while (nextIndex >= 0) {
				result++;
				lastIndex = nextIndex;
				nextIndex = src.IndexOf(s, lastIndex + 1);
			}
			return result;

		}
	}
}
