using System;

namespace WordsViaSubtitle.Contracts
{
    public class PlayTimeDuration
    {
        public PlayTimeDuration() { }
        public TimeSpan Start { get; set; }
        public TimeSpan Stop { get; set; }
    }
}
